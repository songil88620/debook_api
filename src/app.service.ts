import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user/user.entity';
import { BookEntity } from './book/book.entity';
import { BooklistEntity } from './booklist/booklist.entity';
import { AuthorEntity } from './author/author.entity';

@Injectable()
export class AppService {
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

  public limit: number = 50;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchPeople(keyword: string, page: number) {
    const people = await this.userRepository
      .createQueryBuilder('user')
      .where("CONCAT(user.firstName, '', user.lastName) LIKE :keyword", {
        keyword: `%${keyword}%`,
      })
      .take(this.limit)
      .skip((page - 1) * this.limit)
      .getMany();
    return { people };
  }

  async searchBook(keyword: string, page: number) {
    const books = await this.bookRepository
      .createQueryBuilder('book')
      .where('book.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .take(this.limit)
      .skip((page - 1) * this.limit)
      .getMany();
    return { books };
  }

  async searchBooklist(keyword: string, page: number) {
    const booklist = await this.booklistRepository
      .createQueryBuilder('booklist')
      .where('book.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .take(this.limit)
      .skip((page - 1) * this.limit)
      .getMany();
    return { booklist };
  }

  async searchAuthor(keyword: string, page: number) {
    const authors = await this.authorRepository
      .createQueryBuilder('author')
      .innerJoinAndSelect('author.user', 'user')
      .where("CONCAT(user.firstName, '', user.lastName) LIKE :keyword", {
        keyword: `%${keyword}%`,
      })
      .take(this.limit)
      .skip((page - 1) * this.limit)
      .getMany();
    return { authors };
  }
}
