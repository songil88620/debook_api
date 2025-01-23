import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    sourceId: string,
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
      sourceId,
    };
    const c = this.repository.create(new_notification);
    await this.repository.save(c);
  }

  async readAllNotification(notifiee: string) {
    await this.repository.update(
      { notifiee: { firebaseId: notifiee } },
      { status: NOTI_STATUS_TYPE.READ },
    );
    throw new HttpException({ message: 'success' }, HttpStatus.NO_CONTENT);
  }

  async deleteReplyNotification(del_list: string[]) {
    await this.repository.delete({ sourceId: In(del_list) });
  }

  async deleteNotificatonSimple(condition: object) {
    await this.repository.delete(condition);
  }

  async getMyNotification(notifiee: string) {
    const notifys = await this.repository.find({
      where: {
        notifiee: { firebaseId: notifiee },
        status: NOTI_STATUS_TYPE.PENDING,
      },
      relations: ['notifier'],
    });
    if (notifys) {
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
    } else {
      return { notifications: [] };
    }
  }
}
