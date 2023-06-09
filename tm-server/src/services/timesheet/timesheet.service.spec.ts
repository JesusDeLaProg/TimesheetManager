import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IActivity,
  IPhase,
  IProject,
  ITimesheet,
  IUser,
  ProjectType,
  UserRole,
} from '@tm/types/models/datamodels';
import { DateTime } from 'luxon';
import { TimesheetService } from './timesheet.service';
import { closeFirestore, initFirestore } from '//test/test-base';
import { ACTIVITIES, PHASES, PROJECTS, USERS } from '//config/constants';
import { TimesheetValidator } from '//dtos/timesheet';
import { Provider } from '@nestjs/common';

const subadminUser: IUser = {
  _id: '0',
  billingGroups: [],
  email: 'subadmin@tm.com',
  firstName: 'subadmin',
  lastName: 'subadmin',
  isActive: true,
  role: UserRole.SUBADMIN,
  username: 'subadmin',
  password: 'abcdef',
};

const adminUser: IUser = {
  _id: '1',
  billingGroups: [],
  email: 'admin@tm.com',
  firstName: 'admin',
  lastName: 'admin',
  isActive: true,
  role: UserRole.ADMIN,
  username: 'admin',
  password: '123456',
};

describe('TimesheetService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: TimesheetService;
  let providers: Provider[];
  let Users: CollectionReference<IUser>;
  let Projects: CollectionReference<IProject>;
  let Phases: CollectionReference<IPhase>;
  let Activities: CollectionReference<IActivity>;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimesheetService, TimesheetValidator, ...providers],
    }).compile();

    service = module.get<TimesheetService>(TimesheetService);
    Users = module.get(USERS);
    Projects = module.get(PROJECTS);
    Phases = module.get(PHASES);
    Activities = module.get(ACTIVITIES);

    await db.runTransaction(async (transaction) => {
      transaction
        .set(
          Users.doc(subadminUser._id),
          Object.assign({ _id: undefined }, subadminUser),
        )
        .set(
          Users.doc(adminUser._id),
          Object.assign({ _id: undefined }, adminUser),
        )
        .set(Projects.doc('2'), {
          client: 'Client 1',
          code: '23-01',
          name: 'Proj 1',
          isActive: true,
          type: ProjectType.PUBLIC,
        })
        .set(Phases.doc('3'), { code: 'AD', name: 'Admin', activities: ['4'] })
        .set(Activities.doc('4'), { code: 'GE', name: 'General' });
    });
  });

  afterEach(async () => {
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent creating timesheets for more priviledged users', async () => {
    const begin = DateTime.fromSQL('2023-03-12');
    const newTimesheet: ITimesheet = {
      user: '1',
      begin: begin.toJSDate(),
      end: begin.plus({ days: 13 }).toJSDate(),
      lines: [
        {
          project: '2',
          phase: '3',
          activity: '4',
          entries: [
            { date: begin.toJSDate(), time: 1 },
            { date: begin.plus({ days: 1 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 2 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 3 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 4 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 5 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 6 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 7 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 8 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 9 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 10 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 11 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 12 }).toJSDate(), time: 1 },
            { date: begin.plus({ days: 13 }).toJSDate(), time: 1 },
          ],
        },
      ],
      roadsheetLines: [],
    };
    await expect(service.create(subadminUser, newTimesheet)).rejects.toEqual({
      code: 403,
      message: expect.stringMatching(
        /Création refusée sur ressource timesheet-manager\/test_[a-f0-9-]+\/timesheet/,
      ),
    });
  });
});
