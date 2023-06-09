import { Firestore, DocumentReference } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { PhaseService } from './phase.service';
import { initFirestore, closeFirestore } from '//test/test-base';
import { PhaseValidator } from '//dtos/phase';
import { Provider } from '@nestjs/common';

describe('PhaseService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: PhaseService;
  let providers: Provider[];

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhaseService, PhaseValidator, ...providers],
    }).compile();

    service = module.get<PhaseService>(PhaseService);
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
