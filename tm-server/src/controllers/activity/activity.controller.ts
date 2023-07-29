import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ActivityService } from '//services/activity/activity.service';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { QueryOpts } from '//decorators/query_options.decorator';
import { User } from '//dtos/user';
import { QueryOptions } from '//dtos/query_options';

@Controller('activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('list')
  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions?: QueryOptions,
  ) {
    return this.activityService.get(user, queryOptions);
  }

  @Get('getbyid/:id')
  async getById(@AuthenticatedUser() user: User, @Param('id') id: string) {
    return this.activityService.getById(user, id);
  }

  @Post('create')
  async create(@AuthenticatedUser() user: User, @Body() activity: any) {
    return this.activityService.create(user, activity);
  }

  @Get('update')
  async update(@AuthenticatedUser() user: User, @Body() activity: any) {
    return this.activityService.update(user, activity);
  }

  @Get('validate')
  async validate(@Body() activity: any) {
    return this.activityService.validate(activity);
  }
}
