import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { AuthorEntity } from 'src/author/author.entity';

@Injectable()
export class SearchService {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchPeople(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [people, total] = await this.userRepository
      .createQueryBuilder('users')
      .where(
        "LOWER(CONCAT(COALESCE(users.firstName, ''), ' ', COALESCE(users.lastName, ''))) LIKE LOWER(:keyword)",
        {
          keyword: `%${keyword.toLowerCase()}%`,
        },
      )
      .select([
        'users.firebaseId',
        'users.firstName',
        'users.lastName',
        'users.phoneNumber',
        'users.photo',
        'users.biography',
      ])
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { people, pagination };
  }

  async searchBook(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [books, total] = await this.bookRepository
      .createQueryBuilder('books')
      .where('LOWER(books.title) LIKE LOWER(:keyword)', {
        keyword: `%${keyword.toLowerCase()}%`,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { books, pagination };
  }

  async searchBooklist(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [booklists, total] = await this.booklistRepository
      .createQueryBuilder('booklists')
      .where('LOWER(booklists.title) LIKE LOWER(:keyword)', {
        keyword: `%${keyword.toLowerCase()}%`,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { booklists, pagination };
  }

  async searchAuthor(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [authors, total] = await this.authorRepository
      .createQueryBuilder('authors')
      .innerJoinAndSelect('authors.user', 'user')
      .where(
        "LOWER(CONCAT(COALESCE(user.firstName, ''), ' ', COALESCE(user.lastName, ''))) LIKE LOWER(:keyword)",
        {
          keyword: `%${keyword.toLowerCase()}%`,
        },
      )
      .select([
        'authors.id',
        'user.firebaseId',
        'user.firstName',
        'user.lastName',
        'user.phoneNumber',
        'user.photo',
        'user.biography',
      ])
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    const a = authors.map((author: any) => {
      return { ...author.user, authorId: author.id };
    });
    return { authors: a, pagination };
  }
}
