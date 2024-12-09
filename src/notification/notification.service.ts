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
    extra: string,
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
      extra: extra,
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
    const notifys = await this.repository.find({
      where: {
        notifiee: { firebaseId: notifiee },
        status: NOTI_STATUS_TYPE.PENDING,
      },
      relations: ['notifier'],
    });
    const notifications = notifys.map((n) => {
      if (n.type == NOTI_TYPE.COMMENT_LIKE) {
        return {
          createdAt: n.created,
          notificationId: n.id,
          type: n.type,
          data: {
            commentId: JSON.parse(n.extra).commentId,
            lineId: JSON.parse(n.extra).lineId,
            linePicture: JSON.parse(n.extra).linePicture,
            userId: n.notifier.firebaseId,
            username: n.notifier.username,
            userPicture: n.notifier.photo,
          },
        };
      } else if (n.type == NOTI_TYPE.COMMETN_REPLY) {
        return {
          createdAt: n.created,
          notificationId: n.id,
          type: n.type,
          data: {
            commentId: JSON.parse(n.extra).commentId,
            content: JSON.parse(n.extra).content,
            lineId: JSON.parse(n.extra).lineId,
            userId: n.notifier.firebaseId,
            username: n.notifier.username,
            userPicture: n.notifier.photo,
          },
        };
      } else if (n.type == NOTI_TYPE.NEW_FOLLOWER) {
        return {
          createdAt: n.created,
          notificationId: n.id,
          type: n.type,
          data: {
            userId: n.notifier.firebaseId,
            username: n.notifier.username,
            userPicture: n.notifier.photo,
          },
        };
      } else {
        return {};
      }
    });
    return { notifications };
  }
}
