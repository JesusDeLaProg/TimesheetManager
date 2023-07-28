import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import { closeFirestore, initFirestore } from '//test/test-base';
import { ActivityService } from '//services/activity/activity.service';
import { ActivityValidator } from '//dtos/activity';

describe('ActivityController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: ActivityController;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService, ActivityValidator, ...providers]
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
