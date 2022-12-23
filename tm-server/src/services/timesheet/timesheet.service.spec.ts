import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { ITimesheet, IUser, UserRole } from '@tm/types/models/datamodels';
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
    ({ db, root } = initFirestore());
    Timesheets = root.collection(
      'timesheet',
    ) as CollectionReference<ITimesheet>;
    Users = root.collection('user') as CollectionReference<IUser>;
    await Users.doc(subadminUser._id).set(
      Object.assign({ _id: undefined }, subadminUser),
    );
    await Users.doc(adminUser._id).set(
      Object.assign({ _id: undefined }, adminUser),
    );
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
    const newTimesheet: ITimesheet = {
      user: '1',
      begin: new Date(),
      end: new Date(),
      lines: [],
      roadsheetLines: [],
    };
    expect(service.create(subadminUser, newTimesheet)).rejects.toEqual(
      expect.objectContaining<Status>(
        new Status(
          403,
          'Création refusée sur ressource timesheet-manager/test/timesheet',
        ),
      ),
    );
  });
});
