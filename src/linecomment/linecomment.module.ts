import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { AchievementModule } from 'src/achievement/achievement.module';
import { LinecommentEntity } from './linecomment.entity';
import { LinecommentService } from './linecomment.service';
import { LikeEntity } from 'src/like/like.entity';
import { LikeModule } from 'src/like/like.module';
import { LineEntity } from 'src/line/line.entity';
import { LinecommentController } from './linecomment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LinecommentEntity,
      UserEntity,
      BookEntity,
      LikeEntity,
      LineEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => LikeModule),
  ],
  controllers: [LinecommentController],
  providers: [LinecommentService],
  exports: [LinecommentService],
})
export class LinecommentModule {}