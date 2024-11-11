import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { AchievementService } from './achievement.service';

@Controller('achievements')
export class AchievementController {
  constructor(private achievementService: AchievementService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your achievements',
    schema: {
      example: {},
    },
  })
  async getAllPublic(@User() user: any) {
    return this.achievementService.getMyAchievement(user.uid);
  }
}
