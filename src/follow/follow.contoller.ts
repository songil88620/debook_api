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
import { FollowService } from './follow.service';
import { User } from 'src/user/user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'If the user is already followed do not do anything',
  })
  @HttpCode(204)
  async followUser(@User() user: any, @Param('userId') followeeId: string) {
    await this.followService.followOne(user.uid, followeeId);
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
