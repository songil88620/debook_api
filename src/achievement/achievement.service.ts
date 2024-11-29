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

      // need to check the achievement state and updated the invitationRemainCount of the user if it is reached to some points
      let plus_invite = 0;
      let line_created = 0;
      let booklist_created = 0;
      let followers_get = 0;
      const achievements = await this.repository.find({
        where: { achiever: { firebaseId: user_id } },
      });
      achievements.forEach((ac) => {
        if (ac.type == ACHIEVE_TYPE.BOOKLIST) {
          booklist_created = ac.done;
        }
        if (ac.type == ACHIEVE_TYPE.LINE) {
          line_created = ac.done;
        }
        if (ac.type == ACHIEVE_TYPE.FOLLOW) {
          followers_get = ac.done;
        }
      });
      if (
        (line_created == 3 && booklist_created >= 3) ||
        (booklist_created == 3 && line_created >= 3)
      ) {
        plus_invite = 5;
      } else if (
        (line_created == 6 && booklist_created >= 6) ||
        (booklist_created == 6 && line_created >= 6)
      ) {
        plus_invite = 5;
      } else if (
        (line_created == 9 && booklist_created >= 9) ||
        (booklist_created == 9 && line_created >= 9)
      ) {
        plus_invite = 5;
      } else {
      }

      if (followers_get == 100) {
        plus_invite = 111;
      } else if (followers_get == 5000) {
        plus_invite = 333;
      } else if (followers_get == 10000) {
        plus_invite == 666;
      } else {
      }

      if (plus_invite != 0) {
        const achiever = await this.userRepository.findOne({
          where: { firebaseId: user_id },
        });
        await this.userRepository.update(
          { firebaseId: user_id },
          {
            invitationsRemainingCount:
              achiever.invitationsRemainingCount + plus_invite,
          },
        );
      }
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
