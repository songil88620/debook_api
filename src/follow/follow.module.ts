import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from './follow.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.contoller';
import { UserEntity } from 'src/user/user.entity';
import { AchievementModule } from 'src/achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowEntity, UserEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => AchievementModule),
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
