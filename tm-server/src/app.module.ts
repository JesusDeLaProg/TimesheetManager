import { Module } from '@nestjs/common';
import { AppController } from '//app.controller';
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

Settings.defaultLocale = 'fr-CA';
Settings.defaultZone = 'America/New_York';

@Module({
  imports: [DtoModule, DbModule],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    CrudService,
    UserService,
    ProjectService,
    ActivityService,
    PhaseService,
    TimesheetService,
    AuthService,
  ],
})
export class AppModule {}
