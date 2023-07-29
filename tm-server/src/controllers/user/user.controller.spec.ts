import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Firestore, DocumentReference } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import {
  initFirestore,
  closeFirestore,
  JwtModuleProvider,
} from '//test/test-base';
import { UserService } from '//services/user/user.service';
import { UserValidator } from '//dtos/user';
import { AuthService } from '//services/auth/auth.service';

describe('UserController', () => {
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];
  let controller: UserController;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, UserValidator, AuthService, ...providers],
      imports: [JwtModuleProvider()],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
