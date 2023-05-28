import {
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { closeFirestore, initFirestore } from '//test/test-base';
import { ActivityValidator } from '//dtos/activity';
import { Provider } from '@nestjs/common';

describe('ActivityService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: ActivityService;
  let providers: Provider[];

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        ActivityValidator,
        ...providers
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
