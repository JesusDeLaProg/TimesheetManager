import { closeFirestore, initFirestore } from '//test/test-base';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { ITimesheet } from '@tm/types/models/datamodels';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationResult } from '../types/validator';
import { Timesheet, TimesheetValidator } from './timesheet';

const VALID_INPUT_TIMESHEET: ITimesheet = {
  _id: '1',
  begin: new Date(2023, 2, 5),
  end: new Date(2023, 2, 18),
  user: '2',
  lines: [
    {
      project: '3',
      phase: '4',
      activity: '5',
      entries: [
        { date: new Date(2023, 2, 6), time: 1 },
        { date: new Date(2023, 2, 5), time: 1 },
        { date: new Date(2023, 2, 7), time: 1 },
        { date: new Date(2023, 2, 8), time: 1 },
        { date: new Date(2023, 2, 9), time: 1 },
        { date: new Date(2023, 2, 10), time: 1 },
        { date: new Date(2023, 2, 11), time: 1 },
        { date: new Date(2023, 2, 12), time: 1 },
        { date: new Date(2023, 2, 13), time: 1 },
        { date: new Date(2023, 2, 14), time: 1 },
        { date: new Date(2023, 2, 15), time: 1 },
        { date: new Date(2023, 2, 16), time: 1 },
        { date: new Date(2023, 2, 17), time: 1 },
        { date: new Date(2023, 2, 18), time: 1 },
      ],
    },
  ],
  roadsheetLines: [
    {
      project: '3',
      travels: [
        {
          date: new Date(2023, 2, 5),
          distance: 3,
          expenses: [],
          from: 'Maison',
          to: 'Client',
        },
      ],
    },
  ],
};

const VALID_NORMALIZED_TIMESHEET: ITimesheet = {
  _id: '1',
  begin: new Date(2023, 2, 5),
  end: new Date(2023, 2, 18, 23, 59, 59, 999),
  user: '2',
  lines: [
    {
      project: '3',
      phase: '4',
      activity: '5',
      entries: [
        { date: new Date(2023, 2, 5), time: 1 },
        { date: new Date(2023, 2, 6), time: 1 },
        { date: new Date(2023, 2, 7), time: 1 },
        { date: new Date(2023, 2, 8), time: 1 },
        { date: new Date(2023, 2, 9), time: 1 },
        { date: new Date(2023, 2, 10), time: 1 },
        { date: new Date(2023, 2, 11), time: 1 },
        { date: new Date(2023, 2, 12), time: 1 },
        { date: new Date(2023, 2, 13), time: 1 },
        { date: new Date(2023, 2, 14), time: 1 },
        { date: new Date(2023, 2, 15), time: 1 },
        { date: new Date(2023, 2, 16), time: 1 },
        { date: new Date(2023, 2, 17), time: 1 },
        { date: new Date(2023, 2, 18), time: 1 },
      ],
    },
  ],
  roadsheetLines: [
    {
      project: '3',
      travels: [
        {
          date: new Date(2023, 2, 5),
          distance: 3,
          expenses: [],
          from: 'Maison',
          to: 'Client',
        },
      ],
    },
  ],
};

describe('TimesheetDTO', () => {
  let db: Firestore;
  let root: DocumentReference;
  let validator: TimesheetValidator;
  let collection: CollectionReference<Timesheet>;

  beforeAll(async () => {
    ({ db, root } = await initFirestore());
    collection = root.collection('timesheet').withConverter({
      toFirestore(classObj: Timesheet): DocumentData {
        return instanceToPlain(classObj, { excludePrefixes: ['_'] });
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Timesheet {
        const classObj = plainToInstance(Timesheet, snapshot.data());
        classObj._id = snapshot.id;
        return classObj;
      },
    }) as CollectionReference<Timesheet>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    validator = new TimesheetValidator(collection);
  });

  afterEach(async () => {
    await db.recursiveDelete(collection);
  });

  it('is valid', () => {
    expect(validator.validate(VALID_INPUT_TIMESHEET)).resolves.toEqual<
      ValidationResult<Timesheet>
    >({
      __success: true,
      ...VALID_NORMALIZED_TIMESHEET,
    });
  });

  it('is empty object and invalid', () => {
    expect(validator.validate({})).resolves.toMatchObject<
      ValidationResult<Timesheet>
    >({
      __success: false,
      errors: [
        {
          property: 'user',
          constraints: { isString: 'user doit être du texte' },
        },
        {
          property: 'begin',
          constraints: {
            dayOfWeek: 'La feuille de temps doit commencer un Dimanche',
            daysCount: 'La feuille de temps doit contenir exactement 14 jours',
            isDate: 'begin doit être une date',
            isIntervalBound:
              'Toutes les dates doivent être comprises entre le début et la fin de la feuille de temps',
          },
        },
        {
          property: 'end',
          constraints: {
            dayOfWeek: 'La feuille de temps doit se terminer un Samedi',
            daysCount: 'La feuille de temps doit contenir exactement 14 jours',
            isDate: 'end doit être une date',
            isIntervalBound:
              'Toutes les dates doivent être comprises entre le début et la fin de la feuille de temps',
          },
        },
        {
          property: 'lines',
          constraints: {
            arrayMinSize: 'lines doit contenir au maximum 1 éléments',
            arrayUnique:
              'Chaque ligne doit avoir une combinaison project, activité, phase, divers différent',
            isArray: 'lines doit être une liste',
          },
        },
        {
          property: 'roadsheetLines',
          constraints: {
            isArray: 'roadsheetLines doit être une liste',
            noDateOutsideBounds:
              'Toutes les dates doivent être entre le début et la fin de la feuille de temps',
            noUnknownProject:
              'Tous les projets sur la feuille de dépense doivent être sur la feuille de temps',
          },
        },
      ],
    });
  });

  it('has misaligned time bounds', () => {
    expect(
      validator.validate({
        ...VALID_INPUT_TIMESHEET,
        begin: new Date(2023, 2, 8),
        end: new Date(2023, 2, 10),
        lines: [
          {
            project: '3',
            phase: '4',
            activity: '5',
            entries: [
              { date: new Date(2023, 2, 8), time: 1 },
              { date: new Date(2023, 2, 9), time: 1 },
              { date: new Date(2023, 2, 10), time: 1 },
            ],
          },
        ],
      }),
    ).resolves.toMatchObject<ValidationResult<Timesheet>>({
      __success: false,
      errors: [
        {
          property: 'begin',
          constraints: {
            daysCount: 'La feuille de temps doit contenir exactement 14 jours',
            dayOfWeek: 'La feuille de temps doit commencer un Dimanche',
          },
        },
        {
          property: 'end',
          constraints: {
            daysCount: 'La feuille de temps doit contenir exactement 14 jours',
            dayOfWeek: 'La feuille de temps doit se terminer un Samedi',
          },
        },
        {
          property: 'lines',
          children: [
            {
              property: '0',
              children: [
                {
                  property: 'entries',
                  constraints: {
                    arrayMinSize:
                      'La feuille de temps doit contenir exactement 14 jours',
                  },
                },
              ],
            },
          ],
        },
        {
          property: 'roadsheetLines',
          constraints: {
            noDateOutsideBounds:
              'Toutes les dates doivent être entre le début et la fin de la feuille de temps',
          },
        },
      ],
    });
  });

  it('has date outside bounds', () => {
    expect(
      validator.validate({
        ...VALID_INPUT_TIMESHEET,
        lines: [
          {
            project: '3',
            phase: '4',
            activity: '5',
            entries: [
              { date: new Date(2023, 2, 4), time: 1 },
              { date: new Date(2023, 2, 6), time: 1 },
              { date: new Date(2023, 2, 7), time: 1 },
              { date: new Date(2023, 2, 8), time: 1 },
              { date: new Date(2023, 2, 9), time: 1 },
              { date: new Date(2023, 2, 10), time: 1 },
              { date: new Date(2023, 2, 11), time: 1 },
              { date: new Date(2023, 2, 12), time: 1 },
              { date: new Date(2023, 2, 13), time: 1 },
              { date: new Date(2023, 2, 14), time: 1 },
              { date: new Date(2023, 2, 15), time: 1 },
              { date: new Date(2023, 2, 16), time: 1 },
              { date: new Date(2023, 2, 17), time: 1 },
              { date: new Date(2023, 2, 18), time: 1 },
            ],
          },
        ],
        roadsheetLines: [
          {
            project: '3',
            travels: [
              {
                date: new Date(2023, 2, 4),
                distance: 3,
                expenses: [],
                from: 'Maison',
                to: 'Client',
              },
            ],
          },
        ],
      }),
    ).resolves.toMatchObject<ValidationResult<Timesheet>>({
      __success: false,
      errors: [
        {
          property: 'begin',
          constraints: {
            isIntervalBound:
              'Toutes les dates doivent être comprises entre le début et la fin de la feuille de temps',
          },
        },
        {
          property: 'roadsheetLines',
          constraints: {
            noDateOutsideBounds:
              'Toutes les dates doivent être entre le début et la fin de la feuille de temps',
          },
        },
      ],
    });
  });

  it('is missing a date in the line', () => {
    expect(
      validator.validate({
        ...VALID_INPUT_TIMESHEET,
        lines: [
          {
            project: '3',
            phase: '4',
            activity: '5',
            entries: [
              { date: new Date(2023, 2, 5), time: 1 },
              { date: new Date(2023, 2, 7), time: 1 },
              { date: new Date(2023, 2, 8), time: 1 },
              { date: new Date(2023, 2, 9), time: 1 },
              { date: new Date(2023, 2, 10), time: 1 },
              { date: new Date(2023, 2, 11), time: 1 },
              { date: new Date(2023, 2, 12), time: 1 },
              { date: new Date(2023, 2, 13), time: 1 },
              { date: new Date(2023, 2, 14), time: 1 },
              { date: new Date(2023, 2, 15), time: 1 },
              { date: new Date(2023, 2, 16), time: 1 },
              { date: new Date(2023, 2, 17), time: 1 },
              { date: new Date(2023, 2, 18), time: 1 },
            ],
          },
        ],
        roadsheetLines: [
          {
            project: '3',
            travels: [
              {
                date: new Date(2023, 2, 4),
                distance: 3,
                expenses: [],
                from: 'Maison',
                to: 'Client',
              },
            ],
          },
        ],
      }),
    ).resolves.toMatchObject<ValidationResult<Timesheet>>({
      __success: false,
      errors: [
        {
          property: 'lines',
          children: [
            {
              property: '0',
              children: [
                {
                  property: 'entries',
                  constraints: {
                    arrayMinSize:
                      'La feuille de temps doit contenir exactement 14 jours',
                  },
                },
              ],
            },
          ],
        },
        {
          property: 'roadsheetLines',
          constraints: {
            noDateOutsideBounds:
              'Toutes les dates doivent être entre le début et la fin de la feuille de temps',
          },
        },
      ],
    });
  });

  it('has an unknown project in the roadsheet', () => {
    expect(
      validator.validate({
        ...VALID_INPUT_TIMESHEET,
        roadsheetLines: [
          {
            project: '999',
            travels: [
              {
                date: new Date(2023, 2, 5),
                distance: 3,
                expenses: [],
                from: 'Maison',
                to: 'Client',
              },
            ],
          },
        ],
      }),
    ).resolves.toMatchObject<ValidationResult<Timesheet>>({
      __success: false,
      errors: [
        {
          property: 'roadsheetLines',
          constraints: {
            noUnknownProject:
              'Tous les projets sur la feuille de dépense doivent être sur la feuille de temps',
          },
        },
      ],
    });
  });
});
