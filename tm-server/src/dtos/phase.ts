import { CollectionReference } from '@google-cloud/firestore';
import { IPhase, StringId } from '@tm/types/models/datamodels';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidationError,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';
import { Inject, Injectable } from '@nestjs/common';
import { Activity } from './activity';
import { ACTIVITIES, PHASES } from '//config/constants';

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

@Injectable()
export class PhaseValidator extends BaseObjectValidator<Phase> {
  constructor(
    @Inject(PHASES) phases: CollectionReference<Phase>,
    @Inject(ACTIVITIES) private activities: CollectionReference<Activity>,
  ) {
    super(phases, Phase);
    this.VALIDATORS.push(
      (obj) =>
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
      async (obj) => await this.validateForeignKeys(obj),
    );
  }

  async validateForeignKeys(phase: Phase): Promise<ValidationError[]> {
    const errors = (
      await Promise.all(
        phase.activities.map((a, i) =>
          this.validateForeignKey(
            phase,
            String(i),
            a,
            this.activities,
            'activities',
          ),
        ),
      )
    ).filter((e) => !!e);
    return errors.length > 0
      ? [
          Object.assign(new ValidationError(), {
            property: 'activities',
            target: phase,
            value: phase.activities,
            children: errors,
          } as ValidationError),
        ]
      : [];
  }
}
