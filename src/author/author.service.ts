import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorEntity } from './author.entity';
import { BookService } from 'src/book/book.service';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(AuthorEntity)
    private repository: Repository<AuthorEntity>,
    @Inject(forwardRef(() => BookService)) private bookService: BookService,
  ) {}

  // async inviteAuthor(book_id: string, authors: string[]) {}

  // async acceptAuthor(book_id: string, author_id: string, status: boolean) {}

  async checkAuthor(book_id: string, author_id: string) {
    const author = await this.repository.findOne({
      where: { book: { id: book_id }, user: { firebaseId: author_id } },
    });
    return author ? true : false;
  }
}
