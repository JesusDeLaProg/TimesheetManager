import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { IProject } from '@tm/types/models/datamodels';
import { ProjectService } from './project.service';
import {
  addDocumentsToCollection,
  closeFirestore,
  initFirestore,
  TEST_USER,
} from '//test/test-base';
import { ProjectValidator } from '//dtos/project';
import { Provider } from '@nestjs/common';

describe('ProjectService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: ProjectService;
  let providers: Provider[];
  let collection: CollectionReference<IProject>;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
    collection = root.collection('project') as CollectionReference<IProject>;
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, ProjectValidator, ...providers],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve projects by code prefix', async () => {
    await addDocumentsToCollection(collection, [
      { code: '21-01' },
      { code: '21-02' },
      { code: '21-03' },
      { code: '21-04' },
      { code: '21-05' },
      { code: '21-06' },
      { code: '21-07' },
      { code: '22-01' },
    ]);
    expect(await service.searchByCodePrefix(TEST_USER, '21')).toEqual(
      expect.arrayContaining([
        { _id: expect.any(String), code: '21-01' },
        { _id: expect.any(String), code: '21-02' },
        { _id: expect.any(String), code: '21-03' },
        { _id: expect.any(String), code: '21-04' },
        { _id: expect.any(String), code: '21-05' },
        { _id: expect.any(String), code: '21-06' },
        { _id: expect.any(String), code: '21-07' },
      ]),
    );
  });
});
