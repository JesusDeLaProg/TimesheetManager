import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { ITimesheet, IUser, UserRole } from '@tm/types/models/datamodels';
import { DateTime } from 'luxon';
import { TimesheetService } from './timesheet.service';
import { ROOT_DOC } from '//config/constants';
import { closeFirestore, initFirestore } from '//test/test-base';
import { Status } from '//types/status';

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
  let Timesheets: CollectionReference<ITimesheet>;
  let Users: CollectionReference<IUser>;

  beforeAll(async () => {
    ({ db, root } = await initFirestore());
    Timesheets = root.collection(
      'timesheet',
    ) as CollectionReference<ITimesheet>;
    Users = root.collection('user') as CollectionReference<IUser>;
    await db.runTransaction(async (transaction) => {
      transaction.set(Users.doc(subadminUser._id), Object.assign({ _id: undefined }, subadminUser))
        .set(Users.doc(adminUser._id), Object.assign({ _id: undefined }, adminUser));
    });
  });

  afterAll(async () => {
    await db.recursiveDelete(Users);
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimesheetService, { provide: ROOT_DOC, useValue: root }],
    }).compile();

    service = module.get<TimesheetService>(TimesheetService);
  });

  afterEach(async () => {
    await db.recursiveDelete(Timesheets);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent creating timesheets for more priviledged users', () => {
    const begin = DateTime.fromSQL('2023-03-12');
    const newTimesheet: ITimesheet = {
      user: '1',
      begin: begin.toJSDate(),
      end: begin.plus({ days: 13 }).toJSDate(),
      lines: [{ project: '1', phase: '1', activity: '1', entries: [
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
      ] }],
      roadsheetLines: [],
    };
    expect(service.create(subadminUser, newTimesheet)).rejects.toEqual({
      code: 403,
      message: expect.stringMatching(/Création refusée sur ressource timesheet-manager\/test_[a-f0-9-]+\/timesheet/)
    });
  });
});
