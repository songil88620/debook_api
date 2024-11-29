import { Controller, UseGuards, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.decorator';
import { HomeService } from './home.service';

@Controller('homes')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Get('booksForYou')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getBooksForYou(@User() user: any) {
    const booksForYou = await this.homeService.getBooksForYou(user.uid);
    return { booksForYou };
  }

  @Get('savedBooklists')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getSavedBooklists(@User() user: any) {
    const savedBooklists = await this.homeService.getSavedBooklists(user.uid);
    return { savedBooklists };
  }

  @Get('popularBooklist')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getPopularBooklist() {
    const popularBooklist = await this.homeService.getPopularBooklists();
    return { popularBooklist };
  }

  @Get('addedBooks')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getAddedBooks(@User() user: any) {
    const addedBooks = await this.homeService.getAddedBooks(user.uid);
    return { addedBooks };
  }

  @Get('savedBooks')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getSavedBooks(@User() user: any) {
    const savedBooks = await this.homeService.getSavedBooks(user.uid);
    return { savedBooks };
  }

  @Get('fivePicksForYou')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getFivePicksForYou(@User() user: any) {
    const fivePicksForYou = await this.homeService.getFivePickForYou(user.uid);
    return { fivePicksForYou };
  }

  @Get('mostViewedLineCreators')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getMostViewedLineCreators() {
    const mostViewedLineCreators =
      await this.homeService.getMostViewedLineCreators();
    return { mostViewedLineCreators };
  }

  @Get('bookCategories')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getBookCategories() {
    const bookCategories = await this.homeService.getBookCategories();
    return { bookCategories };
  }

  @Get('recentAddedBooks')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
    schema: {
      example: {},
    },
  })
  async getRecentAddedBooks() {
    const recentAddedBooks = await this.homeService.getRecentAddedBooks();
    return { recentAddedBooks };
  }
}
