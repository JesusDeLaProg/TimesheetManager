import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { IUser, UserRole } from '@tm/types/models/datamodels';
import { closeFirestore, initFirestore } from '//test/test-base';
import { UserService } from './user.service';
import { ROOT_DOC } from '//config/constants';
import { User } from '//dtos/user';

describe('UserService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: UserService;
  const testUser: User = {
    _id: 'abcd',
    username: 'test-user',
    firstName: 'test',
    lastName: 'user',
    email: 'test@tm.net',
    billingGroups: [],
    isActive: true,
    role: UserRole.ADMIN,
  };

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
      billingGroups: [],
      email: 'admin@tm.net',
      role: UserRole.ADMIN,
      isActive: true,
    } as IUser;
    const creationResult = await service.create(testUser, creationRequest);
    expect(creationResult).toEqual(
      expect.objectContaining({ username: 'admin', __success: true }),
    );
    expect(await service.create(testUser, creationRequest)).toEqual({
      username: ["Le nom d'utilisateur doit être unique."],
      firstName: ['Le nom complet doit être unique.'],
      lastName: ['Le nom complet doit être unique.'],
      email: ['Le courriel doit être unique.'],
      __success: false,
    });
  });
});
