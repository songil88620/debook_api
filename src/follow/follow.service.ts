import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { FollowCreateDto } from './dtos';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(FollowEntity)
    private repository: Repository<FollowEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
    }
  }

  async getAll(userid: string) {
    return await this.repository
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
  }
}
