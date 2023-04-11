import { CollectionReference } from '@google-cloud/firestore';
import { IProject, ProjectType, StringId } from '@tm/types/models/datamodels';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';

export class Project implements IProject {
  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  _id?: string;

  @IsString({ message: ValidationMessages.IsString })
  @Matches(/[0-9]{2}-[0-9]{1,3}/, { message: ValidationMessages.Matches })
  code: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  name: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  client: StringId;

  @IsEnum(ProjectType, { message: ValidationMessages.IsEnum })
  type: ProjectType;

  @IsBoolean({ message: ValidationMessages.IsBoolean })
  isActive: boolean;
}

export class ProjectValidator extends BaseObjectValidator<Project> {
  constructor(projects: CollectionReference<Project>) {
    super(projects, Project);
    this.VALIDATORS.push((obj) =>
      this.validateUnique(obj, [
        {
          fields: ['code'],
          errorMessage: 'Le code du project doit être unique.',
        },
      ]),
    );
  }
}
