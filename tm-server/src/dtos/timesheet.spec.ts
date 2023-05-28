import { closeFirestore, initFirestore } from '//test/test-base';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { ITimesheet, ProjectType, UserRole } from '@tm/types/models/datamodels';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationResult } from '../types/validator';
import { Timesheet, TimesheetValidator } from './timesheet';
import { Test, TestingModule } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { User } from './user';
import { Project } from './project';
import { Phase } from './phase';
import { Activity } from './activity';
import { ACTIVITIES, PHASES, PROJECTS, USERS } from '../config/constants';

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
  let providers: Provider[];
  let validator: TimesheetValidator;
  let users: CollectionReference<User>;
  let projects: CollectionReference<Project>;
  let phases: CollectionReference<Phase>;
  let activities: CollectionReference<Activity>;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimesheetValidator,
        ...providers
      ],
    }).compile();

    validator = module.get<TimesheetValidator>(TimesheetValidator);
    users = module.get<CollectionReference<User>>(USERS);
    projects = module.get<CollectionReference<Project>>(PROJECTS);
    phases = module.get<CollectionReference<Phase>>(PHASES);
    activities = module.get<CollectionReference<Activity>>(ACTIVITIES);
    await db.recursiveDelete(root);
  });

  it('is valid', async () => {
    await Promise.all([
      users.doc('2').set({ username: 'admin', firstName: '', lastName: '', billingGroups: [], email: '', isActive: true, password: '', role: UserRole.ADMIN }),
      projects.doc('3').set({ client: 'Client 1', code: '23-01', name: '', isActive: true, type: ProjectType.PRIVE }),
      phases.doc('4').set({ code: 'AB', name: '', activities: ['5'] }),
      activities.doc('5').set({ code: 'BD', name: '' })
    ])
    await expect(validator.validate(VALID_INPUT_TIMESHEET)).resolves.toEqual<
      ValidationResult<Timesheet>
    >({
      __success: true,
      ...VALID_NORMALIZED_TIMESHEET,
    });
  });

  it('is empty object and invalid', async () => {
    await expect(validator.validate({})).resolves.toMatchObject<
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

  it('has misaligned time bounds', async () => {
    await expect(
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

  it('has date outside bounds', async () => {
    await expect(
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

  it('is missing a date in the line', async () => {
    await expect(
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

  it('has an unknown project in the roadsheet', async () => {
    await expect(
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

  it('contains invalid foreign keys', async () => {
    await expect(validator.validate(VALID_INPUT_TIMESHEET)).resolves.toMatchObject<ValidationResult<Timesheet>>({
      __success: false,
      errors: [
        {
          property: 'user',
          constraints: { isForeignKey: 'user doit faire référence à un objet existant dans la collection user' }
        },
        {
          property: 'lines',
          children: [{
            property: '0',
            children: [
              {
                property: 'project',
                constraints: { isForeignKey: 'project doit faire référence à un objet existant dans la collection project' }
              },
              {
                property: 'phase',
                constraints: { isForeignKey: 'phase doit faire référence à un objet existant dans la collection phase' }
              },
              {
                property: 'activity',
                constraints: { isForeignKey: 'activity doit faire référence à un objet existant dans la collection activity' }
              }
            ]
          }]
        }
      ]
    });
  })
});
