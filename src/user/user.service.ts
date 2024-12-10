import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dtos';
import { InvitationService } from 'src/invitation/invitation.service';
import { UploadService } from 'src/upload/upload.service';
import { LoggerService } from 'src/logger/logger.service';
import { LineEntity } from 'src/line/line.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { BookEntity } from 'src/book/book.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(LineEntity)
    private lineRepository: Repository<LineEntity>,
    @InjectRepository(BooklistEntity)
    private booklistRepository: Repository<BooklistEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    @Inject(forwardRef(() => InvitationService))
    private invitationService: InvitationService,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  // called when user register or user login to the app
  async findUser(f_user: UserCreateDto) {
    const user = await this.userRepository.findOne({
      where: { firebaseId: f_user.firebaseId },
    });
    if (!user) {
      const c = this.userRepository.create(f_user);
      const u = await this.userRepository.save(c);
      return { user: u };
    } else {
      return { user };
    }
  }

  // update user profile data
  async update(id: string, user: any) {
    try {
      const old_user = await this.userRepository.findOne({
        where: { firebaseId: id },
      });
      const old_photo = old_user.photo;
      if (old_photo != null && old_photo != user.photo && user.photo == '') {
        // remove old photo file on S3
        this.uploadService.deleteFileOnS3(old_photo);
      }
      await this.userRepository.update({ firebaseId: id }, user);
      const u = await this.userRepository.findOne({
        where: { firebaseId: id },
        relations: ['invitation'],
      });
      return { user: u };
    } catch (e) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getMe(id: string) {
    const user = await this.userRepository.findOne({
      relations: [
        'invitation',
        'savedBook',
        'followee',
        'savedBooklists',
        'lines',
        'lines.book',
      ],
      where: {
        firebaseId: id,
      },
    });
    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }
    const savedBookCount = user.savedBook.length;
    const followerCount = user.followee.length;
    const savedBooklistCount = user.savedBooklists.length;
    const lineCount = user.lines.length;
    delete user.savedBook;
    delete user.followee;
    return {
      user: {
        ...user,
        savedBookCount,
        followerCount,
        savedBooklistCount,
        lineCount,
      },
    };
  }

  async getOne(userid: string, id: string) {
    const user: any = await this.userRepository.findOne({
      relations: [
        'invitation',
        'savedBook',
        'savedBooklists',
        'followee.follower',
        'lines',
        'lines.book',
      ],
      where: {
        firebaseId: id,
      },
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

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    user['savedBookCount'] = user.savedBook.length;
    user['savedBooklistCount'] = user.savedBooklists.length;
    user['followerCount'] = user.followee.length;
    user['lineCount'] = user.lines.length;
    delete user.savedBook;
    //delete user.savedBooklists;
    delete user.followee;
    //delete user.lines;

    if (user.isPublic) {
      this.loggerService.debug('GetUserOne', user);
      return { user };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetUserOne', user);
        return { user };
      } else {
        user['savedBookCount'] = 0;
        user['savedBooklistCount'] = 0;
        user['followerCount'] = 0;
        user['lineCount'] = 0;
        this.loggerService.debug('GetUserOne', user);
        return { user };
      }
    }
  }

  async getOneUserBooklists(userid: string, id: string) {
    const [user, booklists] = await Promise.all([
      this.userRepository.findOne({
        relations: ['followee.follower'],
        where: {
          firebaseId: id,
        },
        select: {
          firebaseId: true,
          isPublic: true,
          followee: true,
        },
      }),
      this.booklistRepository
        .createQueryBuilder('booklists')
        .leftJoinAndSelect('booklists.books', 'books')
        .leftJoinAndSelect('booklists.saved', 'saved')
        .leftJoinAndSelect('booklists.collaborators', 'collaborators')
        .leftJoinAndSelect('collaborators.user', 'user')
        .where('booklists.ownerId = :userId', { userId: id })
        .orWhere('user.firebaseId = :userId', { userId: id })
        .orWhere('saved.firebaseId = :userId', { userId: id })
        .getMany(),
    ]);

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    const booklistWithData = booklists.map((b) => {
      const bookCount = b.books.length;
      const savedCount = b.saved.length;
      const collaboratorCount = b.collaborators.length;
      delete b.books;
      delete b.saved;
      delete b.collaborators;
      return {
        ...b,
        bookCount,
        savedCount,
        collaboratorCount,
      };
    });

    if (user.isPublic) {
      this.loggerService.debug('GetOneBooklists', booklistWithData);
      return { booklists: booklistWithData };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetOneBooklists', booklistWithData);
        return { booklists: booklistWithData };
      } else {
        this.loggerService.debug('GetOneBooklists', []);
        return { booklists: [] };
      }
    }
  }

  async getOneUserLines(userid: string, id: string) {
    const [user, lines] = await Promise.all([
      this.userRepository.findOne({
        relations: ['followee.follower'],
        where: {
          firebaseId: id,
        },
        select: {
          firebaseId: true,
          isPublic: true,
          followee: true,
        },
      }),
      this.lineRepository.find({
        where: { liner: { firebaseId: id } },
        relations: ['book', 'rating', 'likes', 'comments'],
      }),
    ]);

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    const linesWithData = lines.map((line) => {
      const likeCount = line.likes.length;
      const commentCount = line.comments.length;
      const rating = line.rating.rate;
      delete line.likes;
      delete line.comments;
      delete line.rating;
      return {
        ...line,
        likeCount,
        commentCount,
        rating,
      };
    });

    if (user.isPublic) {
      this.loggerService.debug('GetOneLines', linesWithData);
      return { lines: linesWithData };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetOneLines', linesWithData);
        return { lines: linesWithData };
      } else {
        this.loggerService.debug('GetOneLines', []);
        return { lines: [] };
      }
    }
  }

  async findUserByFirebaseId(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        firebaseId: id,
      },
    });
    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }
    return {
      user,
    };
  }
}
