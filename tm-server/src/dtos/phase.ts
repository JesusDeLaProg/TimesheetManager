import { CollectionReference } from '@google-cloud/firestore';
import { IPhase } from '@tm/types/models/datamodels';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';

export class Phase implements IPhase {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @Matches(/[A-Z]{2,3}/)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  activities: string[];
}

export class PhaseValidator extends BaseObjectValidator<Phase> {
  constructor(phases: CollectionReference<Phase>) {
    super(phases, Phase);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['code'],
          errorMessage: 'Le code de la phase doit être unique.',
        },
        {
          fields: ['name'],
          errorMessage: 'Le nom de la phase doit être unique.',
        },
      ]),
    );
  }
}
