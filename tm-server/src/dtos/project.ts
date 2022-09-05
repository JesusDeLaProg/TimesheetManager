import { IProject, ProjectType } from '@tm/types/models/datamodels';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class Project implements IProject {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  client: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsBoolean()
  isActive: boolean;
}
