import { Module } from '@nestjs/common';
import { MagickeyController } from './magickey.controller';

@Module({
  controllers: [MagickeyController],
})
export class MagickeyModule {}
