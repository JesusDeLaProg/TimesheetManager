import { CollectionReference } from '@google-cloud/firestore';
import { IActivity, StringId } from '//types/models/datamodels';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';
import { Inject, Injectable } from '@nestjs/common';
import { ACTIVITIES } from '//config/constants';

export class Activity implements IActivity {
  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  _id?: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @Matches(/[A-Z]{2,3}[0-9]{0,2}/, { message: ValidationMessages.Matches })
  code: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  name: string;
}

@Injectable()
export class ActivityValidator extends BaseObjectValidator<Activity> {
  constructor(@Inject(ACTIVITIES) activities: CollectionReference<Activity>) {
    super(activities, Activity);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['code'],
          errorMessage: "Le code de l'activité doit être unique",
        },
        {
          fields: ['name'],
          errorMessage: "Le nom de l'activité doit être unique",
        },
      ]),
    );
  }
}
