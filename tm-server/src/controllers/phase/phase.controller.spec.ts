import { Test, TestingModule } from '@nestjs/testing';
import { PhaseController } from './phase.controller';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import { closeFirestore, initFirestore } from '//test/test-base';
import { PhaseService } from '//services/phase/phase.service';
import { PhaseValidator } from '//dtos/phase';

describe('PhaseController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: PhaseController;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhaseController],
      providers: [PhaseService, PhaseValidator, ...providers],
    }).compile();

    controller = module.get<PhaseController>(PhaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
