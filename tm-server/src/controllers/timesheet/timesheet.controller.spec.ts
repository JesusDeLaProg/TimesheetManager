import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetController } from './timesheet.controller';
import { Firestore, DocumentReference } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import { ActivityController } from '../activity/activity.controller';
import { initFirestore, closeFirestore } from '//test/test-base';
import { TimesheetService } from '//services/timesheet/timesheet.service';
import { TimesheetValidator } from '//dtos/timesheet';

describe('TimesheetController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: TimesheetController;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimesheetController],
      providers: [TimesheetService, TimesheetValidator, ...providers]
    }).compile();

    controller = module.get<TimesheetController>(TimesheetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
