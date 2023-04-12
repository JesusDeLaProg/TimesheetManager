import { CollectionReference } from '@google-cloud/firestore';
import { IPhase, StringId } from '@tm/types/models/datamodels';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';

export class Phase implements IPhase {
  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  _id?: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @Matches(/[A-Z]{2,3}/, { message: ValidationMessages.Matches })
  code: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  name: string;

  @IsString({ each: true, message: ValidationMessages.IsString })
  @IsNotEmpty({ each: true, message: ValidationMessages.IsNotEmpty })
  @IsArray({ message: ValidationMessages.IsArray })
  activities: StringId[];
}

export class PhaseValidator extends BaseObjectValidator<Phase> {
  constructor(phases: CollectionReference<Phase>) {
    super(phases, Phase);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['code'],
          errorMessage: 'Le code de la phase doit être unique',
        },
        {
          fields: ['name'],
          errorMessage: 'Le nom de la phase doit être unique',
        },
      ]),
    );
  }
}
