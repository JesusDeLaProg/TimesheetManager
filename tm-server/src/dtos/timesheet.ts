import {
  StringId,
  IRoadsheetLine,
  ITimesheet,
  ITimesheetEntry,
  ITimesheetLine,
  ITravel,
  IExpense,
} from '@tm/types/models/datamodels';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class Expense implements IExpense {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class Travel implements ITravel {
  @IsDate()
  date: Date;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  @Min(0)
  distance: number;

  @IsObject({ each: true })
  @Type(() => Expense)
  @ValidateNested({ each: true })
  expenses: IExpense[];
}

export class RoadsheetLine implements IRoadsheetLine {
  @IsString()
  project: StringId;

  @IsObject({ each: true })
  @Type(() => Travel)
  @ValidateNested({ each: true })
  travels: ITravel[];
}

export class TimesheetEntry implements ITimesheetEntry {
  @IsDate()
  date: Date;

  @IsNumber()
  time: number;
}

export class TimesheetLine implements ITimesheetLine {
  @IsString()
  project: StringId;

  @IsString()
  phase: StringId;

  @IsString()
  activity: StringId;

  @IsString()
  divers?: string;

  @IsObject({ each: true })
  @Type(() => TimesheetEntry)
  @ValidateNested({ each: true })
  entries: ITimesheetEntry[];
}

export class Timesheet implements ITimesheet {
  @IsString()
  @IsOptional()
  _id?: StringId;

  @IsString()
  user: StringId;

  @IsDate()
  begin: Date;

  @IsDate()
  end: Date;

  @IsObject({ each: true })
  @Type(() => TimesheetLine)
  @ValidateNested({ each: true })
  lines: ITimesheetLine[];

  @IsObject({ each: true })
  @Type(() => RoadsheetLine)
  @ValidateNested({ each: true })
  roadsheetLines: IRoadsheetLine[];
}
