import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import { closeFirestore, initFirestore } from '//test/test-base';
import { ProjectService } from '//services/project/project.service';
import { ProjectValidator } from '//dtos/project';

describe('ProjectController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: ProjectController;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [ProjectService, ProjectValidator, ...providers]
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
