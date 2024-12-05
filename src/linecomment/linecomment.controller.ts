/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { Tester, User } from 'src/user/user.decorator';
import { LinecommentService } from './linecomment.service';
import { LIKE_TYPE } from 'src/enum';
import { Public } from 'src/auth/public.decorator';

@Controller('linecomments')
export class LinecommentController {
  constructor(private linecommentService: LinecommentService) {}

  @Post('reply')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'reply a comment',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async replyComment(@User() user: any, @Body() data: any) {
    return await this.linecommentService.replyComment(
      user.uid,
      data.lineId,
      data.content,
      data.parentId,
    );
  }

  @Post('likeOrUnlike')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'like or unlike a comment',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async likeOrUnlikeComment(@User() user: any, @Body() data: any) {
    return await this.linecommentService.likeOrUnlikeComment(
      user.uid,
      data.likeId,
      LIKE_TYPE.COMMENT,
    );
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'create a comment',
    schema: {
      example: {},
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to access',
    schema: {
      example: {
        error: {
          code: 'FORBIDDEN',
        },
      },
    },
  })
  async createComment(@User() user: any, @Body() data: any) {
    return await this.linecommentService.createComment(
      user.uid,
      data.lineId,
      data.content,
    );
  }
}
