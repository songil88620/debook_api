import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from './follower.entity';
import { FollowService } from './follower.service';
import { FollowController } from './follower.contoller';
import { UserEntity } from 'src/user/user.entity';
import { AchievementModule } from 'src/achievement/achievement.module';
import { NotificationModule } from 'src/notification/notification.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowEntity, UserEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
