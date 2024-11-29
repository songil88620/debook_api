import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { LineService } from './line.service';
import { LineCreateDto } from './dtos';

@Controller('lines')
export class LineController {
  constructor(private lineService: LineService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Create one line',
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
  async createLine(@User() user: any, @Body() data: LineCreateDto) {
    return await this.lineService.createLine(user.uid, data);
  }

  @Post('likeOrUnlike')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Create one line',
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
  async likeOrUnlike(@User() user: any, @Body() data: any) {
    await this.lineService.likeOrUnlike(user.uid, data.lineId);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
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
  async getLineOne(@User() user: any, @Param('id') id: number) {
    return await this.lineService.getLineOne(user.uid, id);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
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
  async getLines(@User() user: any) {
    return await this.lineService.getLines(user.uid);
  }
}
