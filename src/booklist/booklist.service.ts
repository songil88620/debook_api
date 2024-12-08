import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BooklistEntity } from './booklist.entity';
import { BooklistCreateDto, BooklistUpdateDto } from './dtos';
import { CollaboratorService } from 'src/collaborator/collaborator.service';
import { BookEntity } from 'src/book/book.entity';
import { UserEntity } from 'src/user/user.entity';
import { ACHIEVE_TYPE, INVITATION_STATUS_TYPE } from 'src/enum';
import { AchievementService } from 'src/achievement/achievement.service';
import { UploadService } from 'src/upload/upload.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class BooklistService {
  constructor(
    @InjectRepository(BooklistEntity)
    private repository: Repository<BooklistEntity>,
    @InjectRepository(BookEntity)
    private bookrepository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => CollaboratorService))
    private collaboratorService: CollaboratorService,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  async createOne(data: BooklistCreateDto, ownerId: string) {
    const [user, bookEntities] = await Promise.all([
      this.userRepository.findOne({
        where: {
          firebaseId: ownerId,
        },
      }),
      this.bookrepository.findBy({
        id: In(data.bookIds),
      }),
    ]);

    if (bookEntities.length !== data.bookIds.length) {
      throw new BadRequestException({
        error: {
          code: 'BAD_REQUEST',
          data: null,
        },
      });
    }

    const newBooklist = this.repository.create({
      books: bookEntities,
      collaborators: [user],
      ownerId: user,
      title: data.title,
    });

    const booklist = await this.repository.save(newBooklist);
    await this.achievementService.achieveOne(ownerId, ACHIEVE_TYPE.BOOKLIST);
    this.loggerService.debug('BooklistCreateOne', booklist);
    return {
      booklist,
    };
  }

  async saveOne(saver_id: string, booklist_id: string) {
    const [booklist, user] = await Promise.all([
      this.repository.findOne({
        where: { id: booklist_id },
        relations: ['saved'],
        select: ['id', 'saved'],
      }),
      this.userRepository.findOne({
        where: { firebaseId: saver_id },
      }),
    ]);

    if (booklist.saved.some((item) => item.firebaseId == user.firebaseId)) {
      booklist.saved = booklist.saved.filter(
        (b) => b.firebaseId !== user.firebaseId,
      );
    } else {
      booklist.saved.push(user);
    }
    await this.repository.save(booklist);
  }

  async updateOne(id: string, ownerId: string, data: BooklistUpdateDto) {
    const booklist = await this.repository.findOne({
      where: { id, ownerId: { firebaseId: ownerId } },
    });
    if (booklist.image != null && booklist.image != data.image) {
      // remove old image on S3
      this.uploadService.deleteFileOnS3(booklist.image);
    }
    if (booklist) {
      await this.repository.update(
        { id, ownerId: { firebaseId: ownerId } },
        data,
      );
      const booklist = await this.repository.findOne({
        where: { id, ownerId: { firebaseId: ownerId } },
      });
      return { booklist };
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getList(
    uid: string,
    title: string = '',
    page: number = 1,
    limit: number = 20,
  ) {
    const _title = title == '' ? title : title.toLowerCase();
    const [booklistResult, user_sbooklist] = await Promise.all([
      this.repository
        .createQueryBuilder('booklists')
        .leftJoinAndSelect('booklists.books', 'books')
        .leftJoinAndSelect('booklists.saved', 'saved')
        .where('LOWER(booklists.title) LIKE LOWER(:title)', {
          title: `%${_title}%`,
        })
        .andWhere('booklists.ownerId = :uid', { uid })
        .loadRelationCountAndMap('booklists.bookCount', 'booklists.books')
        .loadRelationCountAndMap('booklists.savedCount', 'booklists.saved')
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy('booklists.updated', 'DESC')
        .getManyAndCount(),
      this.userRepository.findOne({
        where: { firebaseId: uid },
        relations: ['savedBooklists'],
      }),
    ]);
    const [booklist, total] = booklistResult;
    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };
    this.loggerService.debug('BooklistGetList', booklist);
    return {
      booklist,
      pagination,
      savedBooklists: user_sbooklist?.savedBooklists,
    };
  }

  async getOne(id: string, requester_id: string) {
    const booklist = await this.repository.findOne({
      where: { id },
      relations: ['books', 'saved', 'ownerId'],
      select: [
        'id',
        'image',
        'liked',
        'ownerId',
        'public',
        'title',
        'summary',
        'books',
        'saved',
      ],
    });
    if (booklist) {
      // check if this booklist is public or not
      if (booklist.public) {
        return { booklist };
      } else {
        if (booklist.ownerId.firebaseId == id) {
          return { booklist };
        } else {
          // check the collaborator if the requester is in the collaborator list
          const cs = await this.collaboratorService.checkCollaboratorStatus(
            booklist.id,
            requester_id,
            INVITATION_STATUS_TYPE.ACCEPTED,
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

  async deleteOne(id: string, ownerId: string) {
    const bl = await this.repository.findOne({
      where: { id, ownerId: { firebaseId: ownerId } },
    });
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
    ownerId: string,
    booklist_id: string,
    collaborators: string[],
  ) {
    const booklist = await this.repository.findOne({
      where: { id: booklist_id, ownerId: { firebaseId: ownerId } },
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
    const [booklist, book] = await Promise.all([
      this.repository.findOne({
        where: { id: booklist_id, ownerId: { firebaseId: userid } },
        relations: ['books'],
        select: ['id', 'books'],
      }),
      this.bookrepository.findOne({ where: { id: bookid } }),
    ]);

    if (book && booklist) {
      if (booklist.books.some((item) => item.id == bookid)) {
        booklist.books = booklist.books.filter((b) => b.id !== bookid);
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
