import { CollectionReference } from '@google-cloud/firestore';
import {
  IUser,
  ProjectType,
  StringId,
  UserRole,
} from '@tm/types/models/datamodels';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime, Interval } from 'luxon';
import { BaseObjectValidator, normalizeDate } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';
import { Inject, Injectable } from '@nestjs/common';
import { USERS } from '//config/constants';

@ValidatorConstraint({ name: 'timelineCompleteness', async: false })
class TimelineCompletenessValidator implements ValidatorConstraintInterface {
  validate(value: BillingRate[], args?: ValidationArguments): boolean {
    if (!value[0].end) {
      return true;
    }
    let lastEndDate = DateTime.fromJSDate(value[0].end);
    for (let i = 1; i < value.length; ++i) {
      const interval = Interval.fromDateTimes(
        lastEndDate,
        DateTime.fromJSDate(value[i].begin),
      );
      if (
        !interval.isValid ||
        interval.length('hours') > 1 ||
        interval.length('hours') < 0
      ) {
        return false;
      }
      lastEndDate = DateTime.fromJSDate(value[i].end);
    }
    return true;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return 'Les intervales doivent se suivre sans espaces et sans chevauchements';
  }
}

@ValidatorConstraint({ name: 'timelineBounds', async: false })
class TimelineBoundsValidator implements ValidatorConstraintInterface {
  validate(value: BillingRate[], args?: ValidationArguments): boolean {
    return value[0].begin.valueOf() === 0 && !value.slice(-1)[0].end;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return 'Le premier intervale doit commencer le 1er Janvier 1970 et le dernier intervale doit être sans fin';
  }
}

export class BillingRate {
  @IsDate({ message: ValidationMessages.IsDate })
  @Type(() => Date)
  @Transform(({ value }) => normalizeDate(value, 'startOf'), {
    toClassOnly: true,
  })
  begin: Date;

  @IsDate({ message: ValidationMessages.IsDate })
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => value && normalizeDate(value, 'endOf'), {
    toClassOnly: true,
  })
  end?: Date;

  @IsNumber(undefined, { message: ValidationMessages.IsNumber })
  @Min(0, { message: ValidationMessages.Min })
  rate: number;

  @IsString({ message: ValidationMessages.IsString })
  @MinLength(1, { message: ValidationMessages.MinLength })
  jobTitle: string;
}

export class BillingGroup {
  @IsEnum(ProjectType, { message: ValidationMessages.IsEnum })
  projectType: ProjectType;

  @IsArray({ message: ValidationMessages.IsArray })
  @ValidateNested({ each: true })
  @Type(() => BillingRate)
  @ArrayMinSize(1, { message: 'Il doit y avoir au moins 1 taux horaire' })
  @Validate(TimelineCompletenessValidator)
  @Validate(TimelineBoundsValidator)
  timeline: BillingRate[];
}

export class User implements IUser {
  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  _id?: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  username: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  firstName: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  lastName: string;

  @IsEnum(UserRole, { message: ValidationMessages.IsEnum })
  role: UserRole;

  @IsString({ message: ValidationMessages.IsString })
  @IsEmail(undefined, { message: ValidationMessages.IsEmail })
  email: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  @ValidateIf((user) => !user._id)
  password?: string;

  @IsArray({ message: ValidationMessages.IsArray })
  @ValidateNested({ each: true })
  @Type(() => BillingGroup)
  @ArrayMinSize(2, { message: 'Il doit y avoir 2 groupes de facturations' })
  @ArrayMaxSize(2, { message: 'Il doit y avoir 2 groupes de facturations' })
  @ArrayUnique((bg: BillingGroup) => bg.projectType, {
    message:
      'Il doit y avoir une liste de taux pour chaque type de facturation',
  })
  billingGroups: BillingGroup[];

  @IsBoolean({ message: ValidationMessages.IsBoolean })
  isActive: boolean;
}

@Injectable()
export class UserValidator extends BaseObjectValidator<User> {
  constructor(@Inject(USERS) users: CollectionReference<User>) {
    super(users, User);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['username'],
          errorMessage: "Le nom d'utilisateur doit être unique.",
        },
        { fields: ['email'], errorMessage: 'Le courriel doit être unique.' },
        {
          fields: ['firstName', 'lastName'],
          errorMessage: 'Le nom complet doit être unique.',
        },
      ]),
    );
  }

  protected normalize(user: User): void {
    for (const group of user.billingGroups ?? []) {
      group.timeline.sort((a, b) => a.begin.valueOf() - b.begin.valueOf());
      for (const rate of group.timeline) {
        if (rate.begin.valueOf() != 0) {
          rate.begin = DateTime.fromJSDate(rate.begin)
            .startOf('day')
            .toJSDate();
        }
        if (rate.end) {
          rate.end = DateTime.fromJSDate(rate.end).endOf('day').toJSDate();
        }
      }
    }
  }
}
