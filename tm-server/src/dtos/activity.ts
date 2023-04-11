import { CollectionReference } from '@google-cloud/firestore';
import { IActivity, StringId } from '@tm/types/models/datamodels';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';

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

export class ActivityValidator extends BaseObjectValidator<Activity> {
  constructor(activities: CollectionReference<Activity>) {
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
