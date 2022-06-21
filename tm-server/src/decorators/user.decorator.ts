import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserInfo } from '//types/request';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserInfo>();
    return request.user;
  },
);
