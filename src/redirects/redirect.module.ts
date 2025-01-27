import { forwardRef, Module } from '@nestjs/common';
import { LineModule } from 'src/line/line.module';
import { RedirectController } from 'src/redirects/redirect.controller';

@Module({
  imports: [forwardRef(() => LineModule)],
  controllers: [RedirectController],
})
export class RedirectModule {}
