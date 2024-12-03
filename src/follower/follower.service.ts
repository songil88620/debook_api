/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { FollowEntity } from './follower.entity';
import { FollowCreateDto } from './dtos';
import { UserEntity } from 'src/user/user.entity';
import { AchievementService } from 'src/achievement/achievement.service';
import { ACHIEVE_TYPE, NOTI_MESSAGES, NOTI_TYPE } from 'src/enum';
import { NotificationService } from 'src/notification/notification.service';
import { LoggerService } from 'src/logger/logger.service';

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
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  async followOne(followerId: string, followeeId: string) {
    if (followerId == followeeId) {
      return;
    }
    const followed = await this.repository.findOne({
      where: {
        follower: { firebaseId: followerId },
        followee: { firebaseId: followeeId },
      },
    });
    if (followed) {
      await this.repository.delete({
        follower: { firebaseId: followerId },
        followee: { firebaseId: followeeId },
      });
    } else {
      const [follower, followee] = await Promise.all([
        this.userRepository.findOne({ where: { firebaseId: followerId } }),
        this.userRepository.findOne({ where: { firebaseId: followeeId } }),
      ]);
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
      const follower_name = follower.firstName + ' ' + follower.lastName;
      this.notificationService.createNotification(
        followerId,
        followeeId,
        NOTI_TYPE.FOLLOW,
        NOTI_MESSAGES.FOLLOW_BY.replace('$NAME', follower_name),
      );
    }
  }

  async getAll(userid: string) {
    const followers = await this.userRepository.find({
      where: { followee: { follower: { firebaseId: userid } } },
      select: [
        'firebaseId',
        'firstName',
        'lastName',
        'phoneNumber',
        'photo',
        'biography',
      ],
    });

    this.loggerService.debug('FollowerGetAll', followers);
    return {
      followers,
    };
  }

  async getRecommendedFollowers(userid: string, filter: string[]) {
    const recommendedFollowers = await this.userRepository.find({
      where: {
        firebaseId: Not(userid),
      },
      select: [
        'firebaseId',
        'firstName',
        'lastName',
        'phoneNumber',
        'photo',
        'biography',
        'savedBooksCount',
      ],
    });
    this.loggerService.debug(
      'FollowerGetRecommendedFollowers',
      recommendedFollowers,
    );
    return {
      recommendedFollowers,
    };
  }
}
