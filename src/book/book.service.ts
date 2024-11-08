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

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity) private repository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AuthorService))
    private authorService: AuthorService,
  ) {}

  private books = [];

  async onModuleInit() {}

  async getBook(limit: number, saver_id: string) {
    const books = await this.repository.find({
      where: { public: true },
      take: limit,
      order: { created: 'DESC' },
    });
    const user_sbook = await this.userRepository.findOne({
      where: { firebaseId: saver_id },
      relations: ['savedBook'],
    });
    return { books, saved_books: user_sbook.savedBook };
  }

  async getOne(userid: string, bookid: string) {
    try {
      const book = await this.repository.findOne({ where: { id: bookid } });
      // if the requester is a author or book is public, return book
      // or not return error based on case
      if (book) {
        const is_author = await this.authorService.checkAuthor(bookid, userid);
        if (is_author || book.public) {
          return book;
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
    } catch (e) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async saveOne(saver_id: string, book_id: string) {
    try {
      const saved_book = await this.repository.findOne({
        where: { id: book_id },
        relations: ['saved'],
      });
      const user = await this.userRepository.findOne({
        where: { firebaseId: saver_id },
      });
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
    } catch (e) {
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
  }
}
