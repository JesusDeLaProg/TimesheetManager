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
import { PUBLIC_KEY } from './config/constants';
import { env } from 'process';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './passport/guards';
import { AuthController } from './controllers/auth/auth.controller';
import { ActivityController } from './controllers/activity/activity.controller';
import { PhaseController } from './controllers/phase/phase.controller';
import { ProjectController } from './controllers/project/project.controller';
import { TimesheetController } from './controllers/timesheet/timesheet.controller';

Settings.defaultLocale = 'fr-CA';
Settings.defaultZone = 'America/New_York';

const privateKey = env.JWT_PRIVATE_KEY || readFileSync('./secrets/private_key');
const publicKey = env.JWT_PRIVATE_KEY || readFileSync('./secrets/public_key');

@Module({
  imports: [
    DtoModule,
    DbModule,
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
