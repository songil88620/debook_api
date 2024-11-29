/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { AchievementService } from 'src/achievement/achievement.service';
import { ACHIEVE_TYPE, LIKE_TYPE } from 'src/enum';
import { LinecommentEntity } from './linecomment.entity';
import { LineEntity } from 'src/line/line.entity';
import { LikeService } from 'src/like/like.service';

@Injectable()
export class LinecommentService {
  constructor(
    @InjectRepository(LinecommentEntity)
    private repository: Repository<LinecommentEntity>,
    @InjectRepository(LineEntity)
    private lineRepository: Repository<LineEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
    @Inject(forwardRef(() => LikeService))
    private likeService: LikeService,
  ) {}

  async createComment(user_id: string, line_id: number, content: string) {
    const [user, line] = await Promise.all([
      this.userRepository.findOne({ where: { firebaseId: user_id } }),
      this.lineRepository.findOne({ where: { id: line_id } }),
    ]);
    if (user && line) {
      const new_comment = {
        line,
        author: user,
        content,
      };
      const c = this.repository.create(new_comment);
      const comment = await this.repository.save(c);
      return { comment };
    } else {
      throw new BadRequestException({
        error: {
          code: 'BAD_REQUEST',
          data: null,
        },
      });
    }
  }

  async replyComment(
    user_id: string,
    line_id: number,
    content: string,
    parent_id: number,
  ) {
    const [user, line] = await Promise.all([
      this.userRepository.findOne({ where: { firebaseId: user_id } }),
      this.lineRepository.findOne({ where: { id: line_id } }),
    ]);
    if (user && line) {
      const new_comment = {
        line,
        author: user,
        content,
        parentId: parent_id,
      };
      const c = this.repository.create(new_comment);
      const comment = await this.repository.save(c);
      return { comment };
    } else {
      throw new BadRequestException({
        error: {
          code: 'BAD_REQUEST',
          data: null,
        },
      });
    }
  }

  async likeOrUnlikeComment(user_id: string, like_id: string, type: LIKE_TYPE) {
    await this.likeService.likeOrUnlike(user_id, like_id, type);
  }
}
