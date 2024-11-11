import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dtos';
import { InvitationService } from 'src/invitation/invitation.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => InvitationService))
    private invitationService: InvitationService,
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
      await this.userRepository.update({ firebaseId: id }, user);
      const u = await this.userRepository.findOne({
        where: { firebaseId: id },
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
      where: { firebaseId: id },
    });
    return { user };
  }

  async findUserByPhone(phoneNumber: string) {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    return { user };
  }
}
