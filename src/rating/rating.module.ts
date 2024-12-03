import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingEntity } from './rating.entity';
import { RatingService } from './rating.service';

@Module({
  imports: [TypeOrmModule.forFeature([RatingEntity])],
  controllers: [],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
