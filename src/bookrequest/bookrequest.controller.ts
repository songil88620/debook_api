import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { BookrequestService } from './bookrequest.service';
import { RequesterCreateDto } from './dtos';

@Controller('bookrequests')
export class BookrequestController {
  constructor(private bookrequestService: BookrequestService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'New book request is created',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    },
  })
  async createBookRequest(@User() user: any, @Body() data: RequesterCreateDto) {
    return this.bookrequestService.createOne(user.uid, data);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your bookrequests',
  })
  async getBookRequestAll(@User() user: any) {
    return this.bookrequestService.getAll(user.uid);
  }
}
