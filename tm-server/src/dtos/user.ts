import {
  IUser,
  ProjectType,
  StringId,
  UserRole,
} from '@tm/types/models/datamodels';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BillingRate {
  @IsDate()
  begin: Date;

  @IsDate()
  @IsOptional()
  end?: Date;

  @IsNumber()
  rate: number;

  @IsString()
  jobTitle: string;
}

export class BillingGroup {
  @IsEnum(ProjectType)
  projectType: ProjectType;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => BillingRate)
  timeline: BillingRate[];
}

export class User implements IUser {
  @IsString()
  @IsOptional()
  _id?: StringId;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => BillingGroup)
  billingGroups: BillingGroup[];

  @IsBoolean()
  isActive: boolean;
}
