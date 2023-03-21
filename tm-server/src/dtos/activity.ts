import { CollectionReference } from '@google-cloud/firestore';
import { IActivity } from '@tm/types/models/datamodels';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';

export class Activity implements IActivity {
  @IsString()
  @IsOptional()
  @MinLength(1)
  _id?: string;

  @IsString()
  @Matches(/[A-Z]{2,3}[0-9]{0,2}/)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ActivityValidator extends BaseObjectValidator<Activity> {
  constructor(activities: CollectionReference<Activity>) {
    super(activities, Activity);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['code'],
          errorMessage: "Le code de l'activité doit être unique.",
        },
        {
          fields: ['name'],
          errorMessage: "Le nom de l'activité doit être unique.",
        },
      ]),
    );
  }
}
