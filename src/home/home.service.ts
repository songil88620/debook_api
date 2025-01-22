/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { AuthorEntity } from 'src/author/author.entity';
import { LineEntity } from 'src/line/line.entity';

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
    @InjectRepository(LineEntity)
    private lineRepository: Repository<LineEntity>,
  ) {}

  async getBooksForYou(userid: string) {
    // TODO: need to run some algorithm based on user data

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
      relations: ['savedBooklists', 'savedBooklists.user'],
      select: {
        firebaseId: true,
        savedBooklists: {
          id: true,
          title: true,
          summary: true,
          image: true,
          user: {
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
    const booklist = await this.booklistRepository.find({
      relations: ['user', 'books', 'saved', 'collaborators'],
      order: {
        liked: 'DESC',
      },
      take: 50,
      select: {
        id: true,
        title: true,
        summary: true,
        image: true,
        user: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
        },
        public: true,
        liked: true,
        books: true,
        saved: true,
        collaborators: true,
      },
    });
    const popularBooklist = booklist.map((b) => {
      const bookCount = b.books.length;
      const savedCount = b.saved.length;
      const collaboratorCount = b.collaborators.length;
      // delete b.books;
      delete b.saved;
      delete b.collaborators;
      return {
        ...b,
        bookCount,
        savedCount,
        collaboratorCount,
      };
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
    // TODO: need to run some algorithm to get 5 picks(books) for user
    const booksForYou = await this.bookRepository.find({
      relations: ['authors', 'booklists', 'saved', 'lines', 'ratings'],
      take: 5,
    });
    return booksForYou;
  }

  async getMostViewedLineCreators() {
    const mostViewedLine = await this.lineRepository
      .createQueryBuilder('lines')
      .leftJoinAndSelect('lines.user', 'user')
      .groupBy('lines.user.firebaseId')
      .orderBy('lines.viewCount', 'DESC')
      .limit(10)
      .getMany();
    const firebaseIds = mostViewedLine.map((result) => result.user.firebaseId);
    const users = await this.userRepository.find({
      where: { firebaseId: In(firebaseIds) },
      relations: [
        'savedBook',
        'booklistOwner',
        'lines',
        'savedBooklists',
        'lines.book',
      ],
      select: {
        firebaseId: true,
        firstName: true,
        lastName: true,
        username: true,
        isPublic: true,
        photo: true,
        invitationsRemainingCount: true,
        backgroundColor: true,
        savedBook: true,
        savedBooklists: true,
        lines: {
          id: true,
          description: true,
          file: true,
          thumbnail: true,
          type: true,
          viewCount: true,
        },
      },
    });
    const sortedUsers = firebaseIds.map((id) =>
      users.find((user) => user.firebaseId === id),
    );
    // Map `linesCount` from raw results to the user entities
    const result = sortedUsers.map((user) => {
      user['savedBookCount'] = user.savedBook.length;
      user['savedBooklistCount'] = user.savedBooklists.length;
      user['lineCount'] = user.lines.length;
      const booklistCount = Number(user?.booklistOwner.length || 0);
      delete user.savedBook;
      delete user.booklistOwner;
      delete user.savedBooklists;
      return {
        ...user,
        booklistCount,
      };
    });
    return result;
  }

  async getTopTenCreators() {
    const rawResults = await this.userRepository
      .createQueryBuilder('users')
      .leftJoin('users.lines', 'lines')
      .select('users.firebaseId', 'firebaseId')
      .addSelect('COUNT(lines.id)', 'linesCount')
      .groupBy('users.firebaseId')
      .orderBy('linesCount', 'DESC')
      .limit(10)
      .getRawMany();

    const firebaseIds = rawResults.map((result) => result.firebaseId);
    const users = await this.userRepository.find({
      where: { firebaseId: In(firebaseIds) },
      relations: [
        'savedBook',
        'booklistOwner',
        'lines',
        'savedBooklists',
        'lines.book',
      ],
      select: {
        firebaseId: true,
        firstName: true,
        lastName: true,
        username: true,
        isPublic: true,
        photo: true,
        invitationsRemainingCount: true,
        backgroundColor: true,
        savedBook: true,
        savedBooklists: true,
        lines: true,
      },
    });
    // Map `linesCount` from raw results to the user entities
    const result = users.map((user) => {
      const matchingRaw = rawResults.find(
        (raw) => raw.firebaseId === user.firebaseId,
      );
      user['savedBookCount'] = user.savedBook.length;
      user['savedBooklistCount'] = user.savedBooklists.length;
      user['lineCount'] = user.lines.length;
      const booklistCount = Number(user?.booklistOwner.length || 0);
      delete user.savedBook;
      delete user.booklistOwner;
      delete user.savedBooklists;
      return {
        ...user,
        booklistCount,
      };
    });
    return result;
  }

  async getBookCategories() {
    return [];
  }

  async getRecentAddedBooks() {
    const recentAddedBooks = await this.bookRepository.find({
      relations: ['authors', 'booklists', 'saved', 'lines', 'ratings'],
      order: {
        created: 'DESC',
      },
      take: 50,
    });
    return recentAddedBooks;
  }

  async getRecommendedFriends(user_id: string) {
    // TODO: add some algorithm for recommended friend search later
    const recommendedFriends = await this.userRepository.find({
      relations: [
        'invitation',
        'savedBook',
        'savedBooklists',
        'followee.follower',
        'lines',
        'lines.book',
      ],
      where: { firebaseId: Not(user_id) },
      select: {
        firebaseId: true,
        firstName: true,
        lastName: true,
        username: true,
        isPublic: true,
        photo: true,
        invitationsRemainingCount: true,
        backgroundColor: true,
        savedBook: true,
        savedBooklists: true,
        followee: true,
        lines: true,
        created: true,
      },
      order: {
        created: 'DESC',
      },
      take: 50,
    });
    recommendedFriends.forEach((user: any) => {
      user['savedBookCount'] = user.savedBook.length;
      user['savedBooklistCount'] = user.savedBooklists.length;
      user['followerCount'] = user.followee.length;
      user['lineCount'] = user.lines.length;
      delete user.savedBook;
      delete user.followee;
    });
    return recommendedFriends;
  }
}
