import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserInfo } from '//types/request';
import { User } from '../dtos/user';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserInfo>();
    return request.user;
  },
);
