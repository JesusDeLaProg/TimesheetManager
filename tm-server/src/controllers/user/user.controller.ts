import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from '//services/user/user.service';
import { QueryOpts } from '//decorators/query_options.decorator';
import { QueryOptions } from '//dtos/query_options';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { User } from '//dtos/user';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('list')
  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions: QueryOptions,
  ) {
    return this.userService.get(user, queryOptions);
  }

  @Get('getbyid/:id')
  async getById(@AuthenticatedUser() user: User, @Param('id') id: string) {
    return this.userService.getById(user, id);
  }

  @Post('create')
  async create(@AuthenticatedUser() authUser: User, @Body() user: any) {
    return this.userService.create(authUser, user);
  }

  @Post('update')
  async update(@AuthenticatedUser() authUser: User, @Body() user: any) {
    return this.userService.update(authUser, user);
  }

  @Post('validate')
  async validate(@Body() user: any) {
    return this.userService.validate(user);
  }
}
