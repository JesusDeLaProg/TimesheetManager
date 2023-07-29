import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TimesheetService } from '//services/timesheet/timesheet.service';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { QueryOpts } from '//decorators/query_options.decorator';
import { User } from '//dtos/user';
import { QueryOptions } from '//dtos/query_options';

@Controller('timesheet')
export class TimesheetController {
  constructor(private timesheetService: TimesheetService) {}

  @Get('list')
  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions?: QueryOptions,
  ) {
    return this.timesheetService.get(user, queryOptions);
  }

  @Get('getbyid/:id')
  async getById(@AuthenticatedUser() user: User, @Param('id') id: string) {
    return this.timesheetService.getById(user, id);
  }

  @Post('create')
  async create(@AuthenticatedUser() user: User, @Body() timesheet: any) {
    return this.timesheetService.create(user, timesheet);
  }

  @Get('update')
  async update(@AuthenticatedUser() user: User, @Body() timesheet: any) {
    return this.timesheetService.update(user, timesheet);
  }

  @Get('validate')
  async validate(@Body() timesheet: any) {
    return this.timesheetService.validate(timesheet);
  }
}
