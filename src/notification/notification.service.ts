import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { UserEntity } from 'src/user/user.entity';
import { NOTI_STATUS_TYPE, NOTI_TYPE } from 'src/enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createNotification(
    notifier: string,
    notifiee: string,
    type: NOTI_TYPE,
    message: string,
  ) {
    const notifier_u = await this.userRepository.findOne({
      where: { firebaseId: notifier },
    });
    const notifiee_u = await this.userRepository.findOne({
      where: { firebaseId: notifiee },
    });
    const new_notification = {
      notifier: notifier_u,
      notifiee: notifiee_u,
      type,
      message,
      status: NOTI_STATUS_TYPE.PENDING,
    };
    const c = this.repository.create(new_notification);
    await this.repository.save(c);
  }

  async updateNotificationStatus(id: number, notifiee: string) {
    try {
      const nt = await this.repository.find({
        where: { id, notifiee: { firebaseId: notifiee } },
      });
      if (nt) {
        await this.repository.update({ id }, { status: NOTI_STATUS_TYPE.READ });
        throw new HttpException({ message: 'success' }, HttpStatus.NO_CONTENT);
      } else {
        throw new HttpException(
          { error: { code: 'FORBIDDEN' } },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (e) {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getMyNotification(notifiee: string) {
    const notification = await this.repository.find({
      where: {
        notifiee: { firebaseId: notifiee },
        status: NOTI_STATUS_TYPE.PENDING,
      },
    });
    return { notification };
  }
}
