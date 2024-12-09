import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BookService } from './book.service';
import { User } from 'src/user/user.decorator';

@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('recommended')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your recommend books',
  })
  async getRecommendedBooks(
    @User() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookService.getRecommendedBooks(user.uid, page, limit);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your book',
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
    description: 'The book not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
        },
      },
    },
  })
  async getOneBook(@User() user: any, @Param('id') id: string) {
    return this.bookService.getOne(user.uid, id);
  }

  @Get(':id/mybook')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Your books',
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
    description: 'The books not exist',
    schema: {
      example: {
        error: {
          code: 'NOT_FOUND',
        },
      },
    },
  })
  async getBooksForMe(@User() user: any) {
    return this.bookService.getMyList(user.uid);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Public books',
    schema: {
      example: {},
    },
  })
  async getAllPublic(
    @User() user: any,
    @Query('filter') filter?: string[],
    @Query('title') title?: string,
    @Query('author') author?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookService.getBooks(user.uid, title, author, page, limit);
  }

  @Post(':bookid/save')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Action is done successfully',
  })
  @HttpCode(204)
  async saveBooklist(@User() user: any, @Param('bookid') bookid: string) {
    this.bookService.saveOne(user.uid, bookid);
  }
}
