/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { FollowCreateDto } from './dtos';
import { UserEntity } from 'src/user/user.entity';
import { AchievementService } from 'src/achievement/achievement.service';
import { ACHIEVE_TYPE, NOTI_MESSAGES, NOTI_TYPE } from 'src/enum';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(FollowEntity)
    private repository: Repository<FollowEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async followOne(followerId: string, followeeId: string) {
    const followed = await this.repository.findOne({
      where: {
        follower: { firebaseId: followerId },
        followee: { firebaseId: followeeId },
      },
    });
    if (followed) {
      await this.repository.update(
        {
          follower: { firebaseId: followerId },
          followee: { firebaseId: followeeId },
        },
        { status: !followed.status },
      );
    } else {
      const follower = await this.userRepository.findOne({
        where: { firebaseId: followerId },
      });
      const followee = await this.userRepository.findOne({
        where: { firebaseId: followeeId },
      });
      const new_follow: FollowCreateDto = {
        follower,
        followee,
        status: true,
      };
      const c = this.repository.create(new_follow);
      await this.repository.save(c);
      // record the achievement
      this.achievementService.achieveOne(followeeId, ACHIEVE_TYPE.FOLLOW);
      // notify to the followee
      this.notificationService.createNotification(
        followerId,
        followeeId,
        NOTI_TYPE.FOLLOW,
        NOTI_MESSAGES.FOLLOW_BY +
          follower.firstName +
          ' ' +
          follower.lastName +
          '.',
      );
    }
  }

  async getAll(userid: string) {
    const follows = await this.repository
      .createQueryBuilder('follow')
      .innerJoinAndSelect('follow.follower', 'follower')
      .where('follow.followee.firebaseId = :userid', { userid })
      .select([
        'follow.id',
        'follow.status',
        'follow.updated',
        'follower.firebaseId',
        'follower.firstName',
        'follower.lastName',
        'follower.phoneNumber',
        'follower.photo',
        'follower.biography',
      ])
      .getMany();
    return { follows };
  }

  async getRecommendFollowee(filter: string[]) {
    const recommendFollowee = await this.userRepository.find({
      select: [
        'firebaseId',
        'firstName',
        'lastName',
        'phoneNumber',
        'photo',
        'biography',
      ],
    });
    return { recommendFollowee };
  }
}
