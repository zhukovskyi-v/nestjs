import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestExpressInterface } from '../../types/requestExpressInterface';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestExpressInterface>();
  if (!request.user) {
    return null;
  }
  if (data) {
    return request.user[data];
  }

  return request.user;
});
