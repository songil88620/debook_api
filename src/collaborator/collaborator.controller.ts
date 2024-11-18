import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { CollaboratorService } from './collaborator.service';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private collaboratorService: CollaboratorService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
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
  @ApiResponse({
    status: 404,
    description: 'The booklist not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
        },
      },
    },
  })
  async getBookListForMe(
    @User() user: any,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.collaboratorService.getCollaborators(
      user.uid,
      name,
      page,
      limit,
    );
  }
}
