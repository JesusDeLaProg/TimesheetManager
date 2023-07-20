import { Controller, Query } from '@nestjs/common';
import { UserService } from '//services/user/user.service';
import { QueryOpts } from '//decorators/query_options.decorator';
import { QueryOptions } from '//dtos/query_options';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { User } from '//dtos/user';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions: Promise<QueryOptions>,
  ) {
    return this.userService.get(user, await queryOptions);
  }
}
