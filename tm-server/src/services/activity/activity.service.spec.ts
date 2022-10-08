import { CollectionReference, DocumentReference, Firestore } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { IActivity } from '@tm/types/models/datamodels';
import { ActivityService } from './activity.service';
import { ROOT_DOC } from '//config/constants';
import { closeFirestore, initFirestore } from '//test/test-base';

describe('ActivityService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: ActivityService;
  let collection: CollectionReference<IActivity>;

  beforeAll(async () => {
    ({ db, root } = initFirestore());
    collection = root.collection('activity') as CollectionReference<IActivity>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityService, { provide: ROOT_DOC, useValue: root }],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  afterEach(async () => {
    await db.recursiveDelete(collection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
