import {
  Firestore,
  DocumentReference,
  CollectionReference,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  initFirestore,
  closeFirestore,
  JwtModuleProvider,
} from '//test/test-base';
import { Provider } from '@nestjs/common';
import { User } from '//dtos/user';
import * as argon2 from 'argon2';
import { USERS } from '//config/constants';
import { IUser, UserRole } from '@tm/types/models/datamodels';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let db: Firestore;
  let root: DocumentReference;
  let service: AuthService;
  let Users: CollectionReference<User>;
  let providers: Provider[];
  let jwtService: JwtService;

  beforeAll(async () => {
    ({ db, root, providers } = await initFirestore());
  });

  afterAll(async () => {
    await closeFirestore({ db, root });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModuleProvider()],
      providers: [AuthService, ...providers],
    }).compile();

    service = module.get<AuthService>(AuthService);
    Users = module.get(USERS);
    jwtService = module.get(JwtService);
    await db.recursiveDelete(root);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('logs in a user', async () => {
    await Users.doc('1').create({
      firstName: 'Admin',
      lastName: 'Admin',
      username: 'admin',
      isActive: true,
      password: await argon2.hash('password'),
      role: UserRole.SUPERADMIN,
      billingGroups: [],
      email: 'admin@timesheetmanager.com',
    });
    expect(await service.login('admin', 'password')).toEqual({
      _id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@timesheetmanager.com',
      role: UserRole.SUPERADMIN,
      billingGroups: [],
      isActive: true,
    });
  });

  it('creates JWT token', async () => {
    const user: User = Object.assign(new User(), {
      _id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@timesheetmanager.com',
      password: 'password',
    });
    const result = await service.generateJwt(user);
    expect(result.payload).toEqual({
      iss: 'TEST',
      iat: expect.any(Number),
      exp: expect.any(Number),
      name: 'Admin Admin',
      sub: '1',
    });
    expect(jwtService.decode(result.token)).toEqual(result.payload);
  });

  it('changes password', async () => {
    const user: IUser = {
      firstName: 'Admin',
      lastName: 'Admin',
      username: 'admin',
      isActive: true,
      password: await argon2.hash('password'),
      role: UserRole.SUPERADMIN,
      billingGroups: [],
      email: 'admin@timesheetmanager.com',
    };
    await Users.doc('1').create(user);
    const u = (await Users.doc('1').get()).data();
    expect(await service.changePassword(u, u, 'newpassword')).toEqual(
      undefined,
    );
    expect(
      await argon2.verify(
        (await Users.doc('1').get()).data().password,
        'newpassword',
      ),
    ).toBe(true);
  });
});
