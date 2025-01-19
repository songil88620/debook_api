import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { Tester, User } from 'src/user/user.decorator';
import { SearchService } from './search.service';
import { Public } from 'src/auth/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  // @UseGuards(FirebaseAuthGuard)
  @Public()
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getAllPublic(
    @Tester() user: any,
    @Query('filter') filter?: string,
    @Query('search') keyword?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (filter == 'people') {
      const people = await this.searchService.searchPeople(
        user.uid,
        keyword,
        page,
        limit,
      );
      return { people };
    } else if (filter == 'books') {
      const books = await this.searchService.searchBook(
        user.uid,
        keyword,
        page,
        limit,
      );
      return { books };
    } else if (filter == 'authors') {
      const authors = await this.searchService.searchAuthor(
        user.uid,
        keyword,
        page,
        limit,
      );
      return { authors };
    } else if (filter == 'booklist') {
      const booklists = await this.searchService.searchBooklist(
        user.uid,
        keyword,
        page,
        limit,
      );
      return { booklists };
    } else {
      const [people, books, authors, booklists] = await Promise.all([
        this.searchService.searchPeople(user.uid, keyword, page, limit),
        this.searchService.searchBook(user.uid, keyword, page, limit),
        this.searchService.searchAuthor(user.uid, keyword, page, limit),
        this.searchService.searchBooklist(user.uid, keyword, page, limit),
      ]);
      return { people, books, authors, booklists };
    }
  }
}
