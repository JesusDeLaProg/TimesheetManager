import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { IUser, ProjectType, UserRole } from '@tm/types/models/datamodels';
import { closeFirestore, initFirestore, testUser } from '//test/test-base';
import { UserService } from './user.service';
import { ROOT_DOC } from '//config/constants';
import { ValidationResult } from '//types/validator';
import { User } from '//dtos/user';

describe('UserService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: UserService;

  beforeAll(async () => {
    ({ db, root } = initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: ROOT_DOC, useValue: root }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    await db.recursiveDelete(root.collection('user'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should prevent creating duplicate users', async () => {
    const creationRequest = {
      username: 'admin',
      password: 'admin',
      firstName: 'admin',
      lastName: 'admin',
      billingGroups: [
        { projectType: ProjectType.PRIVE, timeline: [{ begin: new Date(0), jobTitle: 'Employee', rate: 1 }] },
        { projectType: ProjectType.PUBLIC, timeline: [{ begin: new Date(0), jobTitle: 'Employee', rate: 1 }] }
      ],
      email: 'admin@tm.net',
      role: UserRole.ADMIN,
      isActive: true,
    } as IUser;
    const creationResult = await service.create(testUser, creationRequest);
    expect(creationResult).toEqual(
      expect.objectContaining({ username: 'admin', __success: true }),
    );
    const duplicateCreateResult = await service.create(testUser, creationRequest);
    expect(duplicateCreateResult.__success).toBe(false);
    if (duplicateCreateResult.__success === false) {
      expect(duplicateCreateResult.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ property: 'username', constraints: { isUnique: "Le nom d'utilisateur doit être unique." } }),
        expect.objectContaining({ property: 'firstName', constraints: { isUnique: 'Le nom complet doit être unique.' } }),
        expect.objectContaining({ property: 'lastName', constraints: { isUnique: 'Le nom complet doit être unique.' } }),
        expect.objectContaining({ property: 'email', constraints: { isUnique: 'Le courriel doit être unique.' } }),
      ]))
    }
  });
});
