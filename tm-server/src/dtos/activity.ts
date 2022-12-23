import { IActivity } from '@tm/types/models/datamodels';
import { IsOptional, IsString } from 'class-validator';

export class Activity implements IActivity {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  code: string;

  @IsString()
  name: string;
}
