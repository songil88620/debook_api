import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Tester = createParamDecorator(() => {
  // return { uid: 'o9WdAztNRVfL2sNtGImD9bARv592' };
  // return {
  //   uid: 'o9WdAztNRVfL2sNtGImD9bARv592',
  //   phone_number: '+8615604034323',
  // };
  return {
    uid: 'keCkanrY76ZNbHPo5vCi19e6BIB3',
    phone_number: '+34678136148',
  };
});
