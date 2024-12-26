import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorEntity } from './author.entity';
import { BookService } from 'src/book/book.service';
import * as fs from 'fs';
import * as readline from 'readline';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(AuthorEntity)
    private repository: Repository<AuthorEntity>,
    @Inject(forwardRef(() => BookService)) private bookService: BookService,
  ) {}

  async onModuleInit() {
    // this.insertAuthorData();
  }

  // async inviteAuthor(book_id: string, authors: string[]) {}

  // async acceptAuthor(book_id: string, author_id: string, status: boolean) {}

  async checkAuthor(book_id: string, author_id: number) {
    const author = await this.repository.findOne({
      where: { book: { id: book_id }, author_id: author_id },
    });
    return author ? true : false;
  }

  async insertAuthorData() {
    const filePath = 'goodreads_book_authors.json';
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      try {
        const data = JSON.parse(line);
        const new_author = {
          author_id: data.author_id,
          name: data.name,
          photo: '',
        };
        const c = this.repository.create(new_author);
        await this.repository.save(c);
      } catch (err) {
        console.error(`Error parsing line: ${line}`, err.message);
      }
    }
  }
}
