import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UserDto } from 'src/user/dtos';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BooklistCreateDto, BooklistUpdateDto } from './dtos';
import { BooklistService } from './booklist.service';
import { User } from 'src/user/user.decorator';

@Controller('booklist')
export class BooklistController {
  constructor(private booklistService: BooklistService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The user has created successfully',
    type: UserDto,
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
  async createBookList(
    @User() user: any,
    @Body() booklistCreateDto: BooklistCreateDto,
  ) {
    return this.booklistService.createOne(booklistCreateDto, user.uid);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The user has created successfully',
    schema: {
      example: {},
    },
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
  async updateBookList(
    @User() user: any,
    @Body() data: BooklistUpdateDto,
    @Param('id') id: string,
  ) {
    return this.booklistService.updateOne(id, user.uid, data);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your booklists',
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
  async getBookListForMe(@User() user: any) {
    return this.booklistService.getList(user.uid);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your booklist',
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
  async getOneBookList(@User() user: any, @Param('id') id: string) {
    return this.booklistService.getOne(id, user.uid);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'No permission to delete',
  })
  async deleteOneBookList(@User() user: any, @Param('id') id: string) {
    return this.booklistService.deleteOne(id, user.uid);
  }

  @Post(':booklistid/invite-collaborators')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Invitation sent successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You are not onwer of this booklist',
  })
  async inviteCollaborators(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() data: any,
  ) {
    return this.booklistService.inviteCollaborators(
      user.uid,
      booklistid,
      data.collaborators,
    );
  }

  @Post(':booklistid/accept-collaborator')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not permission for this action',
  })
  async acceptCollaborator(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() data: any,
  ) {
    return this.booklistService.acceptCollaborator(
      user.uid,
      booklistid,
      data.status,
    );
  }

  @Post(':booklistid/add-remove-book')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not permission for this action',
  })
  async addOrRemoveBook(
    @User() user: any,
    @Param('booklistid') booklistid: string,
    @Body() book_id: string,
  ) {
    return this.booklistService.addOrRemoveBook(user.uid, booklistid, book_id);
  }

  @Post(':booklistid/save')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @HttpCode(204)
  async saveBooklist(
    @User() user: any,
    @Param('booklistid') booklistid: string,
  ) {
    return this.booklistService.saveOne(user.uid, booklistid);
  }
}
