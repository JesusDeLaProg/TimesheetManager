import { CollectionReference } from '@google-cloud/firestore';
import { IProject, ProjectType } from '@tm/types/models/datamodels';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BaseObjectValidator } from '//utils/validation';

export class Project implements IProject {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @Matches(/[0-9]{2}-[0-9]{1,3}/)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  client: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsBoolean()
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
