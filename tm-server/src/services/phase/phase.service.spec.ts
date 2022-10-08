import { Firestore, DocumentReference, CollectionReference } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { IPhase } from '@tm/types/models/datamodels';
import { PhaseService } from './phase.service';
import { ROOT_DOC } from '//config/constants';
import { initFirestore, closeFirestore } from '//test/test-base';

describe('PhaseService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: PhaseService;
  let collection: CollectionReference<IPhase>;

  beforeAll(async () => {
    ({ db, root } = initFirestore());
    collection = root.collection('phase') as CollectionReference<IPhase>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhaseService, { provide: ROOT_DOC, useValue: root }],
    }).compile();

    service = module.get<PhaseService>(PhaseService);
  });

  afterEach(async () => {
    await db.recursiveDelete(collection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
