import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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
    // const [people, total] = await this.userRepository
    //   .createQueryBuilder('users')
    //   .where(
    //     "LOWER(CONCAT(COALESCE(users.firstName, ''), ' ', COALESCE(users.lastName, ''))) LIKE LOWER(:keyword) OR LOWER(users.username) LIKE LOWER(:keyword)",
    //     {
    //       keyword: `%${keyword.toLowerCase()}%`,
    //     },
    //   )
    //   .select([
    //     'users.username',
    //     'users.firebaseId',
    //     'users.firstName',
    //     'users.lastName',
    //     'users.phoneNumber',
    //     'users.photo',
    //     'users.biography',
    //   ])
    //   .take(limit)
    //   .skip((page - 1) * limit)
    //   .getManyAndCount();
    // const books = await this.repository.find({
    //   relations: ['authors', 'booklists', 'saved', 'lines', 'ratings'],
    //   where: [
    //     { title: Like(`%${title}%`) },
    //     { authors: { name: Like(`%${author}%`) } },
    //   ],
    //   take: limit,
    //   skip: (page - 1) * limit,
    // });

    const [people, total] = await this.userRepository.findAndCount({
      relations: [
        'invitation',
        'savedBook',
        'savedBooklists',
        'followee.follower',
        'lines',
        'lines.book',
      ],
      where: [
        { firstName: Like(`%${keyword}%`) },
        { lastName: Like(`%${keyword}%`) },
        { username: Like(`%${keyword}`) },
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
        followee: true,
        lines: true,
      },
    });
    const peopleWithData = people.map((user) => {
      user['savedBookCount'] = user.savedBook.length;
      user['savedBooklistCount'] = user.savedBooklists.length;
      user['followerCount'] = user.followee.length;
      user['lineCount'] = user.lines.length;
      delete user.savedBook;
      delete user.followee;
      return { user };
    });
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { people: peopleWithData, pagination };
  }

  async searchBook(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const books = await this.bookRepository.find({
      relations: ['authors', 'booklists', 'saved', 'lines', 'ratings'],
      where: { title: Like(`%${keyword}%`) },
      take: limit,
      skip: (page - 1) * limit,
    });
    const hasNext = books.length >= limit ? true : false;
    const bookWithData = books.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      const booklistCount = book.booklists.length;
      const lineCount = book.lines.length;
      const ratingCount = book.ratings.length;
      delete book.ratings;
      delete book.saved;
      delete book.booklists;
      delete book.lines;
      return {
        ...book,
        ratingAvg: averageRate,
        savedCount,
        booklistCount,
        lineCount,
        ratingCount,
      };
    });
    const pagination = {
      page,
      hasNext,
      limit,
    };
    return { books: bookWithData, pagination };
  }

  async searchBooklist(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [booklists, total] = await this.booklistRepository
      .createQueryBuilder('booklists')
      .leftJoinAndSelect('booklists.books', 'books')
      .leftJoin('booklists.user', 'buser')
      .addSelect([
        'buser.firebaseId',
        'buser.firstName',
        'buser.lastName',
        'buser.photo',
        'buser.biography',
        'buser.username',
      ])
      .leftJoinAndSelect('booklists.saved', 'saved')
      .leftJoinAndSelect('booklists.collaborators', 'collaborators')
      .leftJoinAndSelect('collaborators.user', 'user')
      .where('LOWER(booklists.title) LIKE LOWER(:keyword)', {
        keyword: `%${keyword.toLowerCase()}%`,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    const booklistWithData = booklists.map((b) => {
      const bookCount = b.books.length;
      const savedCount = b.saved.length;
      const collaboratorCount = b.collaborators.length;
      delete b.saved;
      delete b.collaborators;
      return {
        ...b,
        bookCount,
        savedCount,
        collaboratorCount,
      };
    });
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { booklists: booklistWithData, pagination };
  }

  async searchAuthor(
    user_id: string,
    keyword: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [authors, total] = await this.authorRepository
      .createQueryBuilder('authors')
      .where('LOWER(authors.name) LIKE LOWER(:keyword)', {
        keyword: `%${keyword.toLowerCase()}%`,
      })
      .select([
        'authors.author_id',
        'authors.id',
        'authors.name',
        'authors.verified',
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
