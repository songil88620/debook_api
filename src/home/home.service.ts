/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
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

    const booksForYou = await this.bookRepository.find({ take: 50 });
    return booksForYou;
  }

  async getSavedBooklists(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: ['savedBooklists'],
      select: ['firebaseId', 'savedBooklists'],
    });
    return user.savedBooklists;
  }

  async getPopularBooklists() {
    const popularBooklist = await this.booklistRepository.find({
      order: {
        liked: 'DESC',
      },
      take: 50,
    });
    return popularBooklist;
  }

  async getAddedBooks(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: ['savedBook'],
      select: ['firebaseId', 'savedBook'],
    });
    return user.savedBook;
  }

  async getSavedBooks(userid: string) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: userid },
      relations: ['savedBook'],
      select: ['firebaseId', 'savedBook'],
    });
    return user.savedBook;
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
