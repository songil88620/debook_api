import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Tester = createParamDecorator(() => {
  return { uid: 'YMWd8ukOfbVe7jrrwq3SbEVZDs13' };
});
