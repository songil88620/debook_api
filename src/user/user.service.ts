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
    const user = await this.userRepository.findOne({
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

    if (user.isPublic) {
      this.loggerService.debug('GetUserOne', user);
      return { user };
    } else {
      if (user.followee.some((f) => f.follower.firebaseId == userid)) {
        this.loggerService.debug('GetUserOne', user);
        return { user };
      } else {
        user.savedBook = [];
        user.savedBooklists = [];
        this.loggerService.debug('GetUserOne', user);
        return { user };
      }
    }
  }
}
