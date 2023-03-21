import { CollectionReference, Timestamp } from '@google-cloud/firestore';
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
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime, Interval } from 'luxon';
import { BaseObjectValidator } from '//utils/validation';

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
      if (interval.length('hours') > 1 || interval.length('hours') < 0) {
        return false;
      }
      lastEndDate = DateTime.fromJSDate(value[i].end);
    }
    return true;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return 'Les intervales doivent se suivre sans espaces.';
  }
}

@ValidatorConstraint({ name: 'timelineBounds', async: false })
class TimelineBoundsValidator implements ValidatorConstraintInterface {
  validate(value: BillingRate[], args?: ValidationArguments): boolean {
    return value[0].begin.valueOf() === 0 && !value.slice(-1)[0].end;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return 'Le premier intervale doit commencer le 1er Janvier 1970 et le dernier intervale doit être sans fin.';
  }
}

export class BillingRate {
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value instanceof Timestamp ? value.toDate() : value)
  begin: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => value && (value instanceof Timestamp ? value.toDate() : value))
  end?: Date;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsString()
  @MinLength(1)
  jobTitle: string;
}

export class BillingGroup {
  @IsEnum(ProjectType)
  projectType: ProjectType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingRate)
  @ArrayMinSize(1, { message: 'Il doit y avoir au moins 1 taux horaire.' })
  @Validate(TimelineCompletenessValidator)
  @Validate(TimelineBoundsValidator)
  timeline: BillingRate[];
}

export class User implements IUser {
  @IsString()
  @IsOptional()
  _id?: StringId;

  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingGroup)
  @ArrayMinSize(2, { message: 'Il doit y avoir 2 groupes de facturations.' })
  @ArrayMaxSize(2, { message: 'Il doit y avoir 2 groupes de facturations.' })
  billingGroups: BillingGroup[];

  @IsBoolean()
  isActive: boolean;
}

export class UserValidator extends BaseObjectValidator<User> {
  constructor(users: CollectionReference<User>) {
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

  protected normalize(user: User) {
    for (const group of user.billingGroups) {
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
