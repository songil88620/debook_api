/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  UseGuards,
  Param,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { FollowService } from './follower.service';
import { Tester, User } from 'src/user/user.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('followers')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 400,
    description: 'Action is done',
  })
  async followUser(@User() user: any, @Param('userId') followeeId: string) {
    await this.followService.followOne(user.uid, followeeId);
  }

  @Get('recommended')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your recommend followee',
  })
  async getRecommendedFollowers(
    @User() user: any,
    @Query('filter') filter?: string[],
  ) {
    return this.followService.getRecommendedFollowers(user.uid, filter);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your followers',
  })
  async getAllPublic(@User() user: any, @Query('filter') filter?: string[]) {
    return this.followService.getAll(user.uid);
  }
}
