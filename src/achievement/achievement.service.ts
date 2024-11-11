import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementEntity } from './achievement.entity';
import { UserEntity } from 'src/user/user.entity';
import { ACHIEVE_TYPE } from 'src/enum';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(AchievementEntity)
    private repository: Repository<AchievementEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getMyAchievement(user_id: string) {
    const achievements = await this.repository.find({
      where: { achiever: { firebaseId: user_id } },
    });
    return { achievements };
  }

  // call this when one achievement is done
  async achieveOne(user_id: string, type: ACHIEVE_TYPE) {
    const achievement = await this.repository.findOne({
      where: {
        achiever: { firebaseId: user_id },
        type: type,
      },
    });
    if (achievement) {
      await this.repository.update(
        { id: achievement.id },
        { done: achievement.done + 1 },
      );
    } else {
      const achiever = await this.userRepository.findOne({
        where: { firebaseId: user_id },
      });
      const new_ac = {
        achiever,
        done: 1,
        type,
      };
      const c = this.repository.create(new_ac);
      await this.repository.save(c);
    }
  }
}
