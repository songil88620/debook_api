import { Module } from '@nestjs/common';
import { RedirectController } from 'src/redirects/redirect.controller';

@Module({
  controllers: [RedirectController],
})
export class RedirectModule {}
