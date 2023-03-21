import { CollectionReference } from '@google-cloud/firestore';
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
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidationError,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime, Interval } from 'luxon';
import { BaseObjectValidator } from '//utils/validation';

@ValidatorConstraint({ name: 'dayOfWeek', async: false })
class DayOfWeekValidator implements ValidatorConstraintInterface {
  validate(value: Date, args?: ValidationArguments): boolean {
    return DateTime.fromJSDate(value).weekday === args.constraints[0];
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Mauvais jour de la semaine.';
  }
}

@ValidatorConstraint({ name: 'daysCount', async: false })
class DaysCountValidator implements ValidatorConstraintInterface {
  validate(value: Date, args?: ValidationArguments): boolean {
    const [daysCount, otherField] = args.constraints;
    const start = DateTime.fromJSDate(
      value < args.object[otherField] ? value : args.object[otherField],
    );
    const end = DateTime.fromJSDate(
      value < args.object[otherField] ? args.object[otherField] : value,
    );
    return (
      Math.round(Interval.fromDateTimes(start, end).count('days')) === daysCount
    );
  }
  defaultMessage(args?: ValidationArguments): string {
    return `La feuille de temps doit contenir exactement ${args.constraints[0]} jours.`;
  }
}

@ValidatorConstraint({ name: 'isIntervalBound', async: false })
class DateIsIntervalBound implements ValidatorConstraintInterface {
  validate(value: Date, args?: ValidationArguments): boolean {
    const t = args.object as Timesheet;
    const v = DateTime.fromJSDate(value);
    if (args.property === 'begin') {
      for (const line of t.lines) {
        if (!v.equals(DateTime.fromJSDate(line.entries[0].date))) {
          return false;
        }
      }
      return true;
    } else if (args.property === 'end') {
      for (const line of t.lines) {
        if (!v.equals(DateTime.fromJSDate(line.entries.slice(-1)[0].date).endOf('day'))) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Toutes les dates doivent être comprises entre le début et la fin de la feuille de temps.';
  }
}

export class Expense implements IExpense {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class Travel implements ITravel {
  @IsDate()
  date: Date;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
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
  @ArrayUnique((t: ITravel) => DateTime.fromJSDate(t.date).toISODate(), {
    message: 'Chaque date doit se trouver une seule foit dans la liste.',
  })
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
  @IsOptional()
  divers?: string;

  @IsObject({ each: true })
  @Type(() => TimesheetEntry)
  @ValidateNested({ each: true })
  @ArrayMinSize(14, {
    message: 'La feuille de temps doit contenir exactement 14 jours.',
  })
  @ArrayMaxSize(14, {
    message: 'La feuille de temps doit contenir exactement 14 jours.',
  })
  @ArrayUnique(
    (e: ITimesheetEntry) => DateTime.fromJSDate(e.date).toISODate(),
    { message: 'Chaque date doit se trouver une seule foit dans la liste.' },
  )
  entries: ITimesheetEntry[];
}

export class Timesheet implements ITimesheet {
  @IsString()
  @IsOptional()
  _id?: StringId;

  @IsString()
  user: StringId;

  @IsDate()
  @Validate(DayOfWeekValidator, [7], {
    message: 'Doit commencer un Dimanche.',
  })
  @Validate(DaysCountValidator, [14, 'end'])
  @Validate(DateIsIntervalBound)
  begin: Date;

  @IsDate()
  @Validate(DayOfWeekValidator, [6], {
    message: 'Doit se terminer un Samedi.',
  })
  @Validate(DaysCountValidator, [14, 'begin'])
  @Validate(DateIsIntervalBound)
  end: Date;

  @IsObject({ each: true })
  @Type(() => TimesheetLine)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayUnique((line: ITimesheetLine) => [line.project, line.phase, line.activity, line.divers].join('/'))
  lines: ITimesheetLine[];

  @IsObject({ each: true })
  @Type(() => RoadsheetLine)
  @ValidateNested({ each: true })
  roadsheetLines: IRoadsheetLine[];
}

export class TimesheetValidator extends BaseObjectValidator<Timesheet> {
  constructor(timesheets: CollectionReference<Timesheet>) {
    super(timesheets, Timesheet);
    this.VALIDATORS.push((obj) => this.validateNonOverlapping(obj));
  }

  protected normalize(timesheet: Timesheet) {
    timesheet.begin = DateTime.fromJSDate(timesheet.begin)
      .startOf('day')
      .toJSDate();
    timesheet.end = DateTime.fromJSDate(timesheet.end).endOf('day').toJSDate();
    for (const line of timesheet.lines) {
      for (const entry of line.entries) {
        entry.date = DateTime.fromJSDate(entry.date).startOf('day').toJSDate();
      }
    }
    for (const line of timesheet.lines) {
      line.entries.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    }
  }

  private async validateNonOverlapping(
    timesheet: Timesheet,
  ): Promise<ValidationError[]> {
    const threeWeeksBefore = DateTime.fromJSDate(timesheet.begin)
      .minus({ weeks: 3 })
      .startOf('day')
      .toJSDate();
    const threeWeeksAfter = DateTime.fromJSDate(timesheet.begin)
      .plus({ weeks: 3 })
      .endOf('day')
      .toJSDate();
    const possiblyOverlappingTimesheets = [
      ...(await Promise.all([
        this.collection
          .where('begin', '>=', threeWeeksBefore)
          .where('begin', '<=', threeWeeksAfter)
          .get(),
        this.collection
          .where('end', '>=', threeWeeksBefore)
          .where('end', '<=', threeWeeksAfter)
          .get(),
      ])),
    ]
      .map((qs) => qs.docs.map((d) => d.data()))
      .flat();
    const possiblyOverlappingMap = new Map(
      possiblyOverlappingTimesheets.map((t) => [t._id, t]),
    );
    const thisInterval = Interval.fromDateTimes(
      DateTime.fromJSDate(timesheet.begin).startOf('day'),
      DateTime.fromJSDate(timesheet.end).endOf('day'),
    );
    for (const [id, t] of possiblyOverlappingMap) {
      const otherInterval = Interval.fromDateTimes(
        DateTime.fromJSDate(t.begin).startOf('day'),
        DateTime.fromJSDate(t.end).endOf('day'),
      );
      if (thisInterval.intersection(otherInterval) !== null) {
        return [
          Object.assign(new ValidationError(), {
            property: 'begin',
            target: timesheet,
            value: timesheet.begin,
            constraints: {
              noOverlap: `Cette feuille de temps est en conflit avec ${id} qui débute le ${t.begin} et qui se termine le ${t.end}`,
            },
          } as ValidationError),
          Object.assign(new ValidationError(), {
            property: 'end',
            target: timesheet,
            value: timesheet.end,
            constraints: {
              noOverlap: `Cette feuille de temps est en conflit avec ${id} qui débute le ${t.begin} et qui se termine le ${t.end}`,
            },
          } as ValidationError),
        ];
      }
    }
    return [];
  }
}
