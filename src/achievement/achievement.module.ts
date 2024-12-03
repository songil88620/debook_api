import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementEntity } from './achievement.entity';
import { AchievementService } from './achievement.service';
import { UserEntity } from 'src/user/user.entity';
import { AchievementController } from './achievement.contoller';
import { InvitationEntity } from 'src/invitation/invitation.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AchievementEntity, UserEntity, InvitationEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
