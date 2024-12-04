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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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

  async findUserByFirebaseId(id: string) {
    const user = await this.userRepository.findOne({
      relations: ['invitation'],
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

  async findUserByPhone(phoneNumber: string) {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    return { user };
  }

  async getOne(userid: string, id: string) {
    const user: any = await this.userRepository.findOne({
      relations: [
        'invitation',
        'savedBook',
        'savedBooklists',
        'followee.follower',
        'liner',
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
        backgroundColor: true,
        savedBook: true,
        savedBooklists: true,
        followee: true,
        liner: true,
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
    user['lineCount'] = user.liner.length;
    delete user.savedBook;
    delete user.savedBooklists;
    delete user.followee;
    delete user.liner;

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

  async getOneBooks(userid: string, id: string) {
    const user = await this.userRepository.findOne({
      relations: ['savedBook', 'followee.follower'],
      where: {
        firebaseId: id,
      },
      select: {
        firebaseId: true,
        isPublic: true,
        savedBook: true,
        followee: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    if (user.isPublic) {
      this.loggerService.debug('GetOneBooks', user.savedBook);
      return { books: user.savedBook };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetOneBooks', user.savedBook);
        return { books: user.savedBook };
      } else {
        this.loggerService.debug('GetOneBooks', []);
        return { books: [] };
      }
    }
  }

  async getOneBooklists(userid: string, id: string) {
    const user: any = await this.userRepository.findOne({
      relations: ['savedBooklists', 'followee.follower'],
      where: {
        firebaseId: id,
      },
      select: {
        firebaseId: true,
        isPublic: true,
        savedBooklists: true,
        followee: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    if (user.isPublic) {
      this.loggerService.debug('GetOneBooklists', user.savedBooklists);
      return { booklists: user.savedBooklists };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetOneBooklists', user.savedBooklists);
        return { booklists: user.savedBooklists };
      } else {
        this.loggerService.debug('GetOneBooklists', []);
        return { booklists: [] };
      }
    }
  }

  async getOneLines(userid: string, id: string) {
    const user: any = await this.userRepository.findOne({
      relations: ['followee.follower', 'liner'],
      where: {
        firebaseId: id,
      },
      select: {
        firebaseId: true,
        isPublic: true,
        followee: true,
        liner: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
        },
      });
    }

    if (user.isPublic) {
      this.loggerService.debug('GetOneLines', user.liner);
      return { lines: user.liner };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetOneLines', user.liner);
        return { lines: user.liner };
      } else {
        this.loggerService.debug('GetOneLines', []);
        return { lines: [] };
      }
    }
  }
}
