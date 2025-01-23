import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Tester = createParamDecorator(() => {
  // return { uid: 'o9WdAztNRVfL2sNtGImD9bARv592' };
  return {
    uid: 'anGFcjX0VAdXdKaxl4BTVNxNnzf1',
    phone_number: '+8615604034323',
  };
  // return {
  //   uid: 'W4qlYd9ucbdF6B96QFmIJD5mLKH2',
  //   phone_number: '++584143561592',
  // };
});
