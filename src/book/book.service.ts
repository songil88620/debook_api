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
import { uuid } from 'uuidv4';
import { UserEntity } from 'src/user/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { AuthorEntity } from 'src/author/author.entity';
import * as fs from 'fs';
import * as readline from 'readline';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity) private repository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(AuthorEntity)
    private authorRepository: Repository<AuthorEntity>,
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
    const booksResult = await this.repository
      .createQueryBuilder('books')
      .leftJoinAndSelect('books.authors', 'authors')
      // .leftJoin('authors.user', 'user')
      .leftJoin('books.booklists', 'booklist')
      .leftJoinAndSelect('books.saved', 'saved')
      .leftJoin('books.lines', 'lines')
      .leftJoinAndSelect('books.ratings', 'ratings')
      .where('books.title LIKE :title', {
        title: `%${title}%`,
      })
      .orWhere('user.firstName LIKE :firstName', {
        firstName: `%${author}%`,
      })
      .orWhere('user.lastName LIKE :lastName', {
        lastName: `%${author}%`,
      })
      .loadRelationCountAndMap('books.booklistCount', 'books.booklists')
      .loadRelationCountAndMap('books.lineCount', 'books.lines')
      .loadRelationCountAndMap('books.ratingCount', 'books.ratings')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('books.updated', 'DESC')
      .getManyAndCount();

    const [books, total] = booksResult;

    const bookWithData = books.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      delete book.ratings;
      delete book.saved;
      return {
        ...book,
        ratingAvg: averageRate,
        savedCount,
      };
    });

    this.loggerService.debug('GetBooks', bookWithData);

    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { books: bookWithData, pagination };
  }

  async getRecommendedBooks(
    saver_id: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const booksResult = await this.repository
      .createQueryBuilder('books')
      .leftJoinAndSelect('books.authors', 'authors')
      // .leftJoin('authors.user', 'user')
      .leftJoin('books.booklists', 'booklist')
      .leftJoinAndSelect('books.saved', 'saved')
      .leftJoin('books.lines', 'lines')
      .leftJoinAndSelect('books.ratings', 'ratings')
      .loadRelationCountAndMap('books.booklistCount', 'books.booklists')
      .loadRelationCountAndMap('books.lineCount', 'books.lines')
      .loadRelationCountAndMap('books.ratingCount', 'books.ratings')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('books.updated', 'DESC')
      .getManyAndCount();

    const [books, total] = booksResult;

    const bookWithData = books.map((book) => {
      const totalRating = book.ratings.reduce(
        (sum, rating) => sum + rating.rate,
        0,
      );
      const averageRate = book.ratings.length
        ? totalRating / book.ratings.length
        : 0;
      const savedCount = book.saved.length;
      delete book.ratings;
      delete book.saved;
      return {
        ...book,
        ratingAvg: averageRate,
        savedCount,
      };
    });

    this.loggerService.debug('GetBooks', bookWithData);

    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    return { books: bookWithData, pagination };
  }

  async getOne(userid: string, bookid: string) {
    try {
      const book: any = await this.repository.findOne({
        where: { id: bookid },
        relations: ['ratings', 'lines', 'booklists', 'authors'],
        select: {
          id: true,
          title: true,
          summary: true,
          image: true,
          file: true,
          public: true,
          seen: true,
          verified: true,
          created: true,
          updated: true,
          ratings: {
            rate: true,
            id: true,
          },
          lines: true,
          booklists: true,
          authors: {
            author_id: true,
            name: true,
            photo: true,
            verified: true,
          },
        },
      });
      // if the requester is a author or book is public, return book
      // or not return error based on case
      if (book) {
        const rateData = {
          m1: 0,
          m2: 0,
          m3: 0,
          m4: 0,
          m5: 0,
        };
        let averageRate = 0;
        book.ratings.forEach((r: any) => {
          averageRate = averageRate + r.rate;
          if (r.rate == 1) {
            rateData.m1 = rateData.m1 + 1;
          } else if (r.rate == 2) {
            rateData.m2 = rateData.m2 + 1;
          } else if (r.rate == 3) {
            rateData.m3 = rateData.m3 + 1;
          } else if (r.rate == 4) {
            rateData.m4 = rateData.m4 + 1;
          } else {
            rateData.m5 = rateData.m5 + 1;
          }
        });
        averageRate = averageRate / book.ratings.length;
        book['ratingCount'] = book.ratings.length;
        book['ratingData'] = rateData;
        book['ratingAvg'] = averageRate ? averageRate.toFixed(1) : 0;
        book['lineCount'] = book.lines.length;
        book['booklistCount'] = book.booklists.length;
        // book['authors'] = [
        //   {
        //     id: 'xxx',
        //     name: 'Elon Musk',
        //     photo:
        //       'https://debook-user-data.s3.eu-north-1.amazonaws.com/avatar/QDP0fbZdGjhVmtRGU3PxlXXjzt43.1732871567182.jpg',
        //   },
        // ];
        delete book.lines;
        delete book.booklists;
        delete book.ratings;

        // const is_author = await this.authorService.checkAuthor(bookid, userid);
        const is_author = true;
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

  // this code is to upload book from the goodread book data.
  async insertBookData(filePath) {
    console.log('start.....');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const blackLangCode = [
      'msa',
      'ara',
      'per',
      'kat',
      'vie',
      'sin',
      'ben',
      'tel',
      'jpn',
      'tha',
      'hye',
      'urd',
    ];

    // Regex for detecting Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

    // Regex for detecting Hindi (Devanagari) characters
    const hindiRegex = /[\u0900-\u097F]/;

    for await (const line of rl) {
      try {
        const data = JSON.parse(line);

        if (blackLangCode.includes(data.language_code)) continue;

        let title = data.title;
        if (!this.isReadable(data.title)) {
          title = this.convertToReadable(data.title);
        }

        if (arabicRegex.test(title)) {
          continue;
        } else if (hindiRegex.test(title)) {
          continue;
        } else {
        }

        let image = data.image_url;
        if (image.includes('nophoto')) {
          if (data.isbn == '') continue;
          image = `https://covers.openlibrary.org/b/isbn/${data.isbn}-L.jpg`;
        }

        if (image.includes('images.gr-assets.com') && image.includes('m/'))
          image = image.replace(
            /(gr-assets\.com.*?)(m\/)/,
            (match, p1, p2) => p1 + p2.replace('m/', 'l/'),
          );

        const authors = [];
        for await (const a of data.authors) {
          const author_id = Number(a.author_id);
          const author = await this.authorRepository.findOne({
            where: { author_id },
          });
          if (author) authors.push(author);
        }
        if (authors.length == 0) continue;

        const new_book = {
          id: uuid(),
          title,
          summary: data.description,
          image,
          tags: '',
          isbn: data.isbn,
          asin: data.asin,
          file: data.link,
          public: true,
          authors,
        };
        const c = this.repository.create(new_book);
        await this.repository.save(c);
      } catch (err) {
        console.error(`Error`, err);
      }
    }
    console.log('....end');
  }

  isReadable(text: string) {
    const unreadablePattern = /\\u[0-9a-fA-F]{4}/;
    return !unreadablePattern.test(text);
  }

  convertToReadable(text) {
    if (!this.isReadable(text)) {
      return text.replace(/\\u[0-9a-fA-F]{4}/g, (match) => {
        const code = parseInt(match.replace('\\u', ''), 16);
        return String.fromCharCode(code);
      });
    }
    return text;
  }
}
