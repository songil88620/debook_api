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
  //   uid: 'o9WdAztNRVfL2sNtGImD9bARv588',
  //   phone_number: '+8615604034323',
  // };
  return {
    uid: '2zwWN6vfcEQ12elcPgAa62nh5WV1',
    phone_number: '+16555551234',
  };
});
