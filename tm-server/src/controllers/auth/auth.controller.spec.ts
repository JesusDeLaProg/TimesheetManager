import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '//services/auth/auth.service';
import {
  JwtModuleProvider,
  closeFirestore,
  initFirestore,
} from '//test/test-base';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let db: Firestore;
  let root: DocumentReference;
  let providers: Provider[];

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModuleProvider()],
      controllers: [AuthController],
      providers: [AuthService, ...providers],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
