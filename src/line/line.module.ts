import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LineEntity } from './line.entity';
import { LineService } from './line.service';
import { BookEntity } from 'src/book/book.entity';
import { AchievementModule } from 'src/achievement/achievement.module';
import { LineController } from './line.contoller';
import { LikeModule } from 'src/like/like.module';
import { LoggerModule } from 'src/logger/logger.module';
import { RatingEntity } from 'src/rating/rating.entity';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LineEntity,
      UserEntity,
      BookEntity,
      RatingEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => LikeModule),
    forwardRef(() => LoggerModule),
    forwardRef(() => UploadModule),
  ],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
