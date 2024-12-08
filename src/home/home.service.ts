/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { AuthorEntity } from 'src/author/author.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    @InjectRepository(BooklistEntity)
    private booklistRepository: Repository<BooklistEntity>,
    @InjectRepository(AuthorEntity)
    private authorRepository: Repository<AuthorEntity>,
  ) {}

  async getBooksForYou(userid: string) {
    // TODO need to run some algorithm based on user data

    const books = await this.bookRepository.find({
      relations: ['booklists', 'saved', 'lines', 'ratings', 'authors'],
      select: {
        id: true,
        title: true,
        summary: true,
        image: true,
        file: true,
        public: true,
        seen: true,
        verified: true,
        booklists: true,
        saved: true,
        authors: true,
        lines: true,
        ratings: true,
        created: true,
        updated: true,
      },
      take: 50,
    });
    const booksForYou = books.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      const authorCount = book.authors.length;
      const lineCount = book.lines.length;
      const booklistCount = book.booklists.length;
      delete book.saved;
      delete book.authors;
      delete book.lines;
      delete book.booklists;
      delete book.ratings;
      return {
        ...book,
        savedCount,
        authorCount,
        lineCount,
        booklistCount,
        ratingAvg: averageRate,
      };
    });
    return booksForYou;
  }

  async getSavedBooklists(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: ['savedBooklists', 'savedBooklists.ownerId'],
      select: {
        firebaseId: true,
        savedBooklists: {
          id: true,
          title: true,
          summary: true,
          image: true,
          ownerId: {
            firebaseId: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
          public: true,
          liked: true,
        },
      },
    });
    return user.savedBooklists;
  }

  async getPopularBooklists() {
    const popularBooklist = await this.booklistRepository.find({
      relations: ['ownerId'],
      order: {
        liked: 'DESC',
      },
      take: 50,
      select: {
        id: true,
        title: true,
        summary: true,
        image: true,
        ownerId: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
        },
        public: true,
        liked: true,
      },
    });
    return popularBooklist;
  }

  async getAddedBooks(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: [
        'savedBook',
        'savedBook.saved',
        'savedBook.lines',
        'savedBook.ratings',
        'savedBook.authors',
        'savedBook.booklists',
      ],
      select: {
        savedBook: {
          id: true,
          title: true,
          summary: true,
          image: true,
          file: true,
          public: true,
          seen: true,
          verified: true,
          booklists: true,
          saved: true,
          authors: true,
          lines: true,
          ratings: true,
          created: true,
          updated: true,
        },
      },
    });
    const savedBook = user.savedBook.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      const authorCount = book.authors.length;
      const lineCount = book.lines.length;
      const booklistCount = book.booklists.length;
      delete book.saved;
      delete book.authors;
      delete book.lines;
      delete book.booklists;
      delete book.ratings;
      return {
        ...book,
        savedCount,
        authorCount,
        lineCount,
        booklistCount,
        ratingAvg: averageRate,
      };
    });
    return savedBook;
  }

  async getSavedBooks(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: [
        'savedBook',
        'savedBook.saved',
        'savedBook.lines',
        'savedBook.ratings',
        'savedBook.authors',
        'savedBook.booklists',
      ],
      select: {
        savedBook: {
          id: true,
          title: true,
          summary: true,
          image: true,
          file: true,
          public: true,
          seen: true,
          verified: true,
          booklists: true,
          saved: true,
          authors: true,
          lines: true,
          ratings: true,
          created: true,
          updated: true,
        },
      },
    });
    const savedBook = user.savedBook.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      const authorCount = book.authors.length;
      const lineCount = book.lines.length;
      const booklistCount = book.booklists.length;
      delete book.saved;
      delete book.authors;
      delete book.lines;
      delete book.booklists;
      delete book.ratings;
      return {
        ...book,
        savedCount,
        authorCount,
        lineCount,
        booklistCount,
        ratingAvg: averageRate,
      };
    });
    return savedBook;
  }

  async getFivePickForYou(userid: string) {
    // TODO need to run some algorithm to get 5 picks(books) for user
    const booksForYou = await this.bookRepository.find({ take: 5 });
    return booksForYou;
  }

  async getMostViewedLineCreators() {
    return [];
  }

  async getBookCategories() {
    return [];
  }

  async getRecentAddedBooks() {
    const recentAddedBooks = await this.bookRepository.find({
      order: {
        created: 'DESC',
      },
      take: 50,
    });
    return recentAddedBooks;
  }
}
