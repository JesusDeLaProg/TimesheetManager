import { Module } from '@nestjs/common';
import { ActivityValidator } from './activity';
import { PhaseValidator } from './phase';
import { ProjectValidator } from './project';
import { TimesheetValidator } from './timesheet';
import { UserValidator } from './user';

@Module({
    providers: [
        ActivityValidator,
        PhaseValidator,
        ProjectValidator,
        TimesheetValidator,
        UserValidator
    ]
})
export class DtoModule {}
