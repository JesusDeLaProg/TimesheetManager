import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from '//app.service';
import { CrudService } from '//services/crud/crud.service';
import { UserController } from '//controllers/user/user.controller';
import { ProjectService } from '//services/project/project.service';
import { UserService } from '//services/user/user.service';
import { ActivityService } from './services/activity/activity.service';
import { PhaseService } from './services/phase/phase.service';
import { TimesheetService } from './services/timesheet/timesheet.service';
import { Settings } from 'luxon';
import { AuthService } from './services/auth/auth.service';
import { DtoModule } from './dtos/dto.module';
import { DbModule } from './config/db.module';
import { JwtStrategy } from './passport/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { readFileSync } from 'fs';
import { DEFAULT_USER, PUBLIC_KEY } from './config/constants';
import { env } from 'process';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './passport/guards';
import { AuthController } from './controllers/auth/auth.controller';
import { ActivityController } from './controllers/activity/activity.controller';
import { PhaseController } from './controllers/phase/phase.controller';
import { ProjectController } from './controllers/project/project.controller';
import { TimesheetController } from './controllers/timesheet/timesheet.controller';
import { globSync } from 'glob';

Settings.defaultLocale = 'fr-CA';
Settings.defaultZone = 'America/New_York';

const privateKeyFile = (() => {const f = globSync('./secrets/**/JWT_PRIVATE_KEY'); return f.length > 0 ? f[0] : null;})();
const publicKeyFile = (() => {const f = globSync('./secrets/**/JWT_PUBLIC_KEY'); return f.length > 0 ? f[0] : null;})();
const privateKey = env.JWT_PRIVATE_KEY || readFileSync(privateKeyFile);
const publicKey = env.JWT_PUBLIC_KEY || readFileSync(publicKeyFile);
const defaultUser = (() => {
  if (env.DEFAULT_USER) return JSON.parse(env.DEFAULT_USER);
  const secretConstants = readFileSync('./secrets/constants.json');
  if (secretConstants.length) return JSON.parse(secretConstants.toString()).debug_admin_user;
  return null;
})();

@Module({
  imports: [
    DbModule,
    DtoModule,
    JwtModule.register({
      privateKey,
      publicKey,
      signOptions: {
        expiresIn: '1h',
        algorithm: 'ES256',
        issuer: 'Cloud Timesheet-Manager',
        mutatePayload: true,
      },
    }),
    PassportModule,
  ],
  controllers: [
    UserController,
    AuthController,
    ActivityController,
    PhaseController,
    ProjectController,
    TimesheetController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: PUBLIC_KEY, useValue: publicKey },
    { provide: DEFAULT_USER, useValue: defaultUser },
    AppService,
    CrudService,
    UserService,
    ProjectService,
    ActivityService,
    PhaseService,
    TimesheetService,
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AppModule {}
