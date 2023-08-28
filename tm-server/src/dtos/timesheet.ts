import { CollectionReference } from '@google-cloud/firestore';
import {
  StringId,
  IRoadsheetLine,
  ITimesheet,
  ITimesheetEntry,
  ITimesheetLine,
  ITravel,
  IExpense,
} from '//types/models/datamodels';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
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
import { BaseObjectValidator, normalizeDate } from '//utils/validation';
import * as ValidationMessages from '//i18n/validation.json';
import { Inject, Injectable } from '@nestjs/common';
import {
  ACTIVITIES,
  PHASES,
  PROJECTS,
  TIMESHEETS,
  USERS,
} from '//config/constants';
import { User } from './user';
import { Project } from './project';
import { Phase } from './phase';
import { Activity } from './activity';

@ValidatorConstraint({ name: 'dayOfWeek', async: false })
class DayOfWeekValidator implements ValidatorConstraintInterface {
  validate(value?: Date, args?: ValidationArguments): boolean {
    return DateTime.fromJSDate(value).weekday === args.constraints[0];
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Mauvais jour de la semaine';
  }
}

@ValidatorConstraint({ name: 'daysCount', async: false })
class DaysCountValidator implements ValidatorConstraintInterface {
  validate(value?: Date, args?: ValidationArguments): boolean {
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
    return `La feuille de temps doit contenir exactement ${args.constraints[0]} jours`;
  }
}

@ValidatorConstraint({ name: 'isIntervalBound', async: false })
class DateIsIntervalBound implements ValidatorConstraintInterface {
  validate(value?: Date, args?: ValidationArguments): boolean {
    const t = args.object as Timesheet;
    const v = DateTime.fromJSDate(value);
    if (!t.lines) {
      return false;
    }
    if (args.property === 'begin') {
      for (const line of t.lines) {
        if (!v.equals(DateTime.fromJSDate(line.entries[0].date))) {
          return false;
        }
      }
      return true;
    } else if (args.property === 'end') {
      for (const line of t.lines) {
        if (
          !v.equals(
            DateTime.fromJSDate(line.entries.slice(-1)[0].date).endOf('day'),
          )
        ) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Toutes les dates doivent être comprises entre le début et la fin de la feuille de temps';
  }
}

@ValidatorConstraint({ name: 'noUnknownProject', async: false })
class NoUnknownProject implements ValidatorConstraintInterface {
  validate(value?: RoadsheetLine[], args?: ValidationArguments): boolean {
    return value?.every(
      (rl) =>
        !!(args.object as Timesheet)?.lines?.find(
          (l) => l?.project === rl?.project,
        ),
    );
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Tous les projets sur la feuille de dépense doivent être sur la feuille de temps';
  }
}

@ValidatorConstraint({ name: 'noDateOutsideBounds', async: false })
class NoDateOutsideBounds implements ValidatorConstraintInterface {
  validate(value?: RoadsheetLine[], args?: ValidationArguments): boolean {
    const interval = Interval.fromDateTimes(
      DateTime.fromJSDate((args.object as Timesheet).begin),
      DateTime.fromJSDate((args.object as Timesheet).end),
    );
    return value?.every(
      (line) =>
        line.travels?.every((t) =>
          interval.contains(DateTime.fromJSDate(t.date)),
        ),
    );
  }
  defaultMessage(args?: ValidationArguments): string {
    return 'Toutes les dates doivent être entre le début et la fin de la feuille de temps';
  }
}

export class Expense implements IExpense {
  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  description: string;

  @IsNumber(undefined, { message: ValidationMessages.IsNumber })
  @Min(0, { message: ValidationMessages.Min })
  amount: number;
}

export class Travel implements ITravel {
  @IsDate({ message: ValidationMessages.IsDate })
  @Transform(({ value }) => normalizeDate(value, 'startOf'), {
    toClassOnly: true,
  })
  date: Date;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  from: string;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  to: string;

  @IsNumber(undefined, { message: ValidationMessages.IsNumber })
  @Min(0, { message: ValidationMessages.Min })
  distance: number;

  @IsArray({ message: ValidationMessages.IsArray })
  @IsObject({ each: true, message: ValidationMessages.IsObject })
  @Type(() => Expense)
  @ValidateNested({ each: true })
  expenses: IExpense[];
}

export class RoadsheetLine implements IRoadsheetLine {
  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  project: StringId;

  @IsArray({ message: ValidationMessages.IsArray })
  @IsObject({ each: true, message: ValidationMessages.IsObject })
  @Type(() => Travel)
  @Transform(
    ({ value }) =>
      (value as ITravel[]).sort((a, b) => a.date.valueOf() - b.date.valueOf()),
    { toClassOnly: true },
  )
  @ValidateNested({ each: true })
  @ArrayUnique((t: ITravel) => DateTime.fromJSDate(t.date).toISODate(), {
    message: 'Chaque date doit se trouver une seule fois dans la liste',
  })
  travels: ITravel[];
}

export class TimesheetEntry implements ITimesheetEntry {
  @IsDate({ message: ValidationMessages.IsDate })
  @Transform(({ value }) => normalizeDate(value, 'startOf'), {
    toClassOnly: true,
  })
  date: Date;

  @IsNumber(undefined, { message: ValidationMessages.IsNumber })
  time: number;
}

export class TimesheetLine implements ITimesheetLine {
  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  project: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  phase: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @IsNotEmpty({ message: ValidationMessages.IsNotEmpty })
  activity: StringId;

  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  divers?: string;

  @IsArray({ message: ValidationMessages.IsArray })
  @IsObject({ each: true, message: ValidationMessages.IsObject })
  @Type(() => TimesheetEntry)
  @Transform(
    ({ value }) =>
      (value as ITimesheetEntry[]).sort(
        (a, b) => a.date.valueOf() - b.date.valueOf(),
      ),
    { toClassOnly: true },
  )
  @ValidateNested({ each: true })
  @ArrayMinSize(14, {
    message: 'La feuille de temps doit contenir exactement 14 jours',
  })
  @ArrayMaxSize(14, {
    message: 'La feuille de temps doit contenir exactement 14 jours',
  })
  @ArrayUnique(
    (e: ITimesheetEntry) => DateTime.fromJSDate(e.date).toISODate(),
    { message: 'Chaque date doit se trouver une seule foit dans la liste' },
  )
  entries: ITimesheetEntry[];
}

export class Timesheet implements ITimesheet {
  @IsString({ message: ValidationMessages.IsString })
  @IsOptional()
  _id?: StringId;

  @IsString({ message: ValidationMessages.IsString })
  user: StringId;

  @IsDate({ message: ValidationMessages.IsDate })
  @Validate(DayOfWeekValidator, [7], {
    message: 'La feuille de temps doit commencer un Dimanche',
  })
  @Validate(DaysCountValidator, [14, 'end'])
  @Validate(DateIsIntervalBound)
  @Transform(({ value }) => normalizeDate(value, 'startOf'), {
    toClassOnly: true,
  })
  begin: Date;

  @IsDate({ message: ValidationMessages.IsDate })
  @Validate(DayOfWeekValidator, [6], {
    message: 'La feuille de temps doit se terminer un Samedi',
  })
  @Validate(DaysCountValidator, [14, 'begin'])
  @Validate(DateIsIntervalBound)
  @Transform(({ value }) => normalizeDate(value, 'endOf'), {
    toClassOnly: true,
  })
  end: Date;

  @IsArray({ message: ValidationMessages.IsArray })
  @Type(() => TimesheetLine)
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: ValidationMessages.ArrayMinSize })
  @ArrayUnique(
    (line: ITimesheetLine) =>
      [line.project, line.phase, line.activity, line.divers].join('/'),
    {
      message:
        'Chaque ligne doit avoir une combinaison project, activité, phase, divers différent',
    },
  )
  lines: ITimesheetLine[];

  @IsArray({ message: ValidationMessages.IsArray })
  @Type(() => RoadsheetLine)
  @ValidateNested({ each: true })
  @Validate(NoUnknownProject)
  @Validate(NoDateOutsideBounds)
  roadsheetLines: IRoadsheetLine[];
}

@Injectable()
export class TimesheetValidator extends BaseObjectValidator<Timesheet> {
  constructor(
    @Inject(TIMESHEETS) timesheets: CollectionReference<Timesheet>,
    @Inject(USERS) private users: CollectionReference<User>,
    @Inject(PROJECTS) private projects: CollectionReference<Project>,
    @Inject(PHASES) private phases: CollectionReference<Phase>,
    @Inject(ACTIVITIES) private activities: CollectionReference<Activity>,
  ) {
    super(timesheets, Timesheet);
    this.VALIDATORS.push(
      (obj) => this.validateNonOverlapping(obj),
      (obj) => this.validateForeignKeys(obj),
      (obj) => this.validateActivitiesInPhase(obj),
    );
  }

  protected normalize(timesheet: Timesheet): void {
    timesheet.begin = DateTime.fromJSDate(timesheet.begin)
      .startOf('day')
      .toJSDate();
    timesheet.end = DateTime.fromJSDate(timesheet.end).endOf('day').toJSDate();
    for (const line of timesheet.lines ?? []) {
      for (const entry of line.entries ?? []) {
        entry.date = DateTime.fromJSDate(entry.date).startOf('day').toJSDate();
      }
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
          .where('user', '==', timesheet.user)
          .where('begin', '>=', threeWeeksBefore)
          .where('begin', '<=', threeWeeksAfter)
          .get(),
        this.collection
          .where('user', '==', timesheet.user)
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

  async validateForeignKeys(timesheet: Timesheet): Promise<ValidationError[]> {
    const errors = [
      this.validateForeignKey(timesheet, 'user', timesheet.user, this.users),
      new Promise(async (resolve: (v: ValidationError) => void, reject) => {
        try {
          const linesError = Object.assign(new ValidationError(), {
            property: 'lines',
            target: timesheet,
            value: timesheet.lines,
            children: (
              await Promise.all(
                timesheet.lines.map(async (l, i) =>
                  Object.assign(new ValidationError(), {
                    property: String(i),
                    target: timesheet.lines,
                    value: l,
                    children: (
                      await Promise.all([
                        this.validateForeignKey(
                          timesheet,
                          'project',
                          timesheet.lines[i].project,
                          this.projects,
                        ),
                        this.validateForeignKey(
                          timesheet,
                          'phase',
                          timesheet.lines[i].phase,
                          this.phases,
                        ),
                        this.validateForeignKey(
                          timesheet,
                          'activity',
                          timesheet.lines[i].activity,
                          this.activities,
                        ),
                      ])
                    ).filter((e) => !!e),
                  } as ValidationError),
                ),
              )
            ).filter((l) => l.children.length > 0),
          } as ValidationError);
          resolve(linesError.children.length > 0 ? linesError : null);
        } catch (e) {
          reject(e);
        }
      }),
    ];
    return (await Promise.all(errors)).filter((e) => !!e);
  }

  async validateActivitiesInPhase(
    timesheet: Timesheet,
  ): Promise<ValidationError[]> {
    const error = Object.assign(new ValidationError(), {
      property: 'lines',
      target: timesheet,
      value: timesheet.lines,
      children: (
        await Promise.all(
          timesheet.lines.map(async (l, i) => {
            const phase = (await this.phases.doc(l.phase).get()).data();
            if (phase.activities.includes(l.activity)) {
              return null;
            } else {
              return Object.assign(new ValidationError(), {
                property: String(i),
                target: timesheet.lines,
                value: l,
                children: [
                  Object.assign(new ValidationError(), {
                    property: 'activity',
                    target: l,
                    value: l.activity,
                    constraints: {
                      activityAllowedWithPhase: `${l.activity} doit être une activité permise pendant la phase ${phase.code}`,
                    },
                  } as ValidationError),
                ],
              } as ValidationError);
            }
          }),
        )
      ).filter((e) => e?.children.length > 0),
    } as ValidationError);
    return error.children.length > 0 ? [error] : [];
  }
}
