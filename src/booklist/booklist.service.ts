import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooklistEntity } from './booklist.entity';
import { BooklistCreateDto, BooklistUpdateDto } from './dtos';
import { uuid } from 'uuidv4';
import { CollaboratorService } from 'src/collaborator/collaborator.service';
import { BookService } from 'src/book/book.service';
import { BookEntity } from 'src/book/book.entity';
import { UserEntity } from 'src/user/user.entity';
import { STATUS_TYPE } from 'src/enum';

@Injectable()
export class BooklistService {
  constructor(
    @InjectRepository(BooklistEntity)
    private repository: Repository<BooklistEntity>,
    @InjectRepository(BookEntity)
    private bookrepository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => BookService)) private bookService: BookService,
    @Inject(forwardRef(() => CollaboratorService))
    private collaboratorService: CollaboratorService,
  ) {}

  async createOne(booklist: BooklistCreateDto, owner_id: string) {
    const new_booklist = {
      id: uuid(),
      title: booklist?.title,
      owner_id,
      collaborator: uuid(),
      book_ids: JSON.stringify(booklist?.book_ids),
    };
    const c = this.repository.create(new_booklist);
    return await this.repository.save(c);
  }

  async saveOne(saver_id: string, booklist_id: string) {
    const booklist = await this.repository.findOne({
      where: { id: booklist_id },
      relations: ['saved'],
    });
    const user = await this.userRepository.findOne({
      where: { firebaseId: saver_id },
    });
    if (booklist.saved.some((item) => item.firebaseId == user.firebaseId)) {
      booklist.saved = booklist.saved.filter(
        (b) => b.firebaseId !== user.firebaseId,
      );
    } else {
      booklist.saved.push(user);
    }
    await this.repository.save(booklist);
  }

  async updateOne(id: string, owner_id: string, data: BooklistUpdateDto) {
    const booklist = await this.repository.findOne({ where: { id, owner_id } });
    if (booklist) {
      await this.repository.update({ id, owner_id }, data);
      return this.repository.findOne({ where: { id, owner_id } });
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getList(uid: string) {
    const booklist = await this.repository.find({ where: { owner_id: uid } });
    const user_sbooklist = await this.userRepository.findOne({
      where: { firebaseId: uid },
      relations: ['savedBooklists'],
    });
    return { booklist, saved_booklist: user_sbooklist.savedBooklists };
  }

  async getOne(id: string, requester_id: string) {
    const booklist = await this.repository.findOne({
      where: { id },
      relations: ['books'],
    });
    if (booklist) {
      // check if this booklist is public or not
      if (booklist.public) {
        return { booklist };
      } else {
        if (booklist.owner_id == id) {
          return { booklist };
        } else {
          // check the collaborator if the requester is in the collaborator list
          const cs = await this.collaboratorService.checkCollaboratorStatus(
            booklist.id,
            requester_id,
            STATUS_TYPE.ACCEPTED,
          );
          if (cs) {
            // if this requester is a collaborator of this list, return result
            return { booklist };
          } else {
            // or not, return permission limit
            throw new HttpException(
              { error: { code: 'FORBIDDEN' } },
              HttpStatus.FORBIDDEN,
            );
          }
        }
      }
    } else {
      throw new HttpException(
        { error: { code: 'NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async deleteOne(id: string, owner_id: string) {
    const bl = await this.repository.findOne({ where: { id, owner_id } });
    if (bl) {
      await this.repository.delete({ id });
      throw new HttpException({ message: 'success' }, HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async inviteCollaborators(
    owner_id: string,
    booklist_id: string,
    collaborators: string[],
  ) {
    const booklist = await this.repository.findOne({
      where: { id: booklist_id, owner_id },
    });
    if (booklist) {
      await this.collaboratorService.inviteCollaborators(
        booklist_id,
        collaborators,
      );
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async acceptCollaborator(
    collaborator_id: string,
    booklist_id: string,
    status: boolean,
  ) {
    const booklist = await this.repository.findOne({
      where: { id: booklist_id },
    });
    if (booklist) {
      await this.collaboratorService.acceptCollaborator(
        booklist_id,
        collaborator_id,
        status,
      );
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  // add or remove a book from the booklist
  async addOrRemoveBook(userid: string, booklist_id: string, bookid: string) {
    const booklist = await this.repository.findOne({
      where: { id: booklist_id, owner_id: userid },
      relations: ['books'],
    });
    const book = await this.bookrepository.findOne({ where: { id: bookid } });

    if (book && booklist) {
      if (booklist.books.some((item) => item.id == book.id)) {
        booklist.books = booklist.books.filter((b) => b.id !== book.id);
      } else {
        booklist.books.push(book);
      }
      await this.repository.save(booklist);
      throw new HttpException({ message: 'success' }, HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
