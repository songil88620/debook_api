import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookEntity } from './book.entity';
import { AuthorService } from 'src/author/author.service';
import axios from 'axios';
import { uuid } from 'uuidv4';
import { UserEntity } from 'src/user/user.entity';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity) private repository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AuthorService))
    private authorService: AuthorService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  private books = [];
  public count = 0;

  async onModuleInit() {}

  async getBooks(
    saver_id: string,
    title: string = '',
    author: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const [booksResult, userBook] = await Promise.all([
      this.repository
        .createQueryBuilder('books')
        .leftJoinAndSelect('books.authors', 'authors')
        .leftJoinAndSelect('authors.user', 'user')
        .where('books.title LIKE :title', {
          title: `%${title}%`,
        })
        .orWhere('user.firstName LIKE :firstName', {
          firstName: `%${author}%`,
        })
        .orWhere('user.lastName LIKE :lastName', {
          lastName: `%${author}%`,
        })
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy('books.updated', 'DESC')
        .getManyAndCount(),

      this.userRepository.findOne({
        where: { firebaseId: saver_id },
        relations: ['savedBook'],
      }),
    ]);

    const [books, total] = booksResult;
    this.loggerService.debug('GetBooks', books);

    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { books, savedBooks: userBook?.savedBook, pagination };
  }

  async getRecommendedBooks(
    saver_id: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const [books, total] = await this.repository
      .createQueryBuilder('books')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('books.updated', 'DESC')
      .getManyAndCount();

    this.loggerService.debug('GetRecommendedBooks', books);

    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    this.loggerService.debug('GetRecommendedBooks', books);
    return { books, pagination };
  }

  async getOne(userid: string, bookid: string) {
    try {
      const book = await this.repository.findOne({ where: { id: bookid } });
      // if the requester is a author or book is public, return book
      // or not return error based on case
      if (book) {
        const is_author = await this.authorService.checkAuthor(bookid, userid);
        if (is_author || book.public) {
          return { book };
        } else {
          throw new HttpException(
            { error: { code: 'FORBIDDEN' } },
            HttpStatus.FORBIDDEN,
          );
        }
      } else {
        throw new HttpException(
          { error: { code: 'NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      this.loggerService.error('BookGetOne', error);
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async saveOne(saver_id: string, book_id: string) {
    try {
      const [saved_book, user] = await Promise.all([
        this.repository.findOne({
          where: { id: book_id },
          relations: ['saved'],
        }),
        this.userRepository.findOne({
          where: { firebaseId: saver_id },
        }),
      ]);

      if (
        saved_book.saved.some((item) => item?.firebaseId == user.firebaseId)
      ) {
        saved_book.saved = saved_book.saved.filter(
          (b) => b.firebaseId !== user.firebaseId,
        );
      } else {
        saved_book.saved.push(user);
      }
      await this.repository.save(saved_book);
    } catch (error) {
      this.loggerService.error('BookSaveOne', error);
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMyList(userid: string) {}

  // for test dummy data insetting
  async fetchBook() {
    for (const b of this.books) {
      const res = await axios.get('https://openlibrary.org/search.json?q=' + b);
      const book_data = res.data.docs[0];
      let image = '';
      if (book_data?.isbn) {
        image =
          'https://covers.openlibrary.org/b/isbn/' +
          book_data.isbn[0] +
          '-L.jpg';
      }
      if (image == '') {
        continue;
      }
      const title = book_data.title;
      const subject = book_data.subject;
      let summary = '';
      if (book_data?.first_sentence) {
        summary = book_data?.first_sentence[0];
      }
      this.addOneBook(title, summary, image, JSON.stringify(subject));
    }
  }

  async addRandom() {
    for (let i = 0; i < 1000000; i++) {
      const title = this.generateRandomString(10);
      const summary = this.generateRandomString(30);
      const tags = '';
      const image = 'https://covers.openlibrary.org/b/isbn/0425031748-L.jpg';
      await this.addOneBook(title, summary, image, tags);
    }
  }

  async addOneBook(
    title: string,
    summary: string,
    image: string,
    tags: string,
  ) {
    const new_book = {
      id: uuid(),
      title,
      summary,
      image,
      tags,
      public: true,
    };
    const c = this.repository.create(new_book);
    await this.repository.save(c);
    this.count++;
    console.log('>>', this.count);
  }

  generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
