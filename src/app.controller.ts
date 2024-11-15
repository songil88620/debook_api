/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './auth/auth.guard';
import { User } from './user/user.decorator';

@Controller('search')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getAllPublic(
    @User() user: any,
    @Query('filter') filter?: string,
    @Query('search') keyword?: string,
    @Query('page') page?: number,
  ) {
    let _page = 1;
    if(page){
      _page = page;
    }

    if(filter == 'people'){
      return await this.appService.searchPeople(keyword, _page);
    }else if(filter == 'books'){
      return await this.appService.searchBook(keyword, _page)
    }else if(filter == 'authors'){
      return await this.appService.searchAuthor(keyword, _page);
    }else if(filter == 'booklist'){
      return await this.appService.searchBooklist(keyword, _page);
    }else{
      const { people } = await this.appService.searchPeople(keyword, _page);
      const { books } = await this.appService.searchBook(keyword, _page);
      const { authors } = await this.appService.searchAuthor(keyword, _page);
      const { booklist } = await this.appService.searchBooklist(keyword, _page);
      return { people, books, authors, booklist };
    }
  }
}
