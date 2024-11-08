import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementEntity } from './achievement.entity';
import { AchievementService } from './achievement.service';
import { UserEntity } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AchievementEntity, UserEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
