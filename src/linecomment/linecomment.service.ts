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
import { LIKE_TYPE, NOTI_TYPE } from 'src/enum';
import { LinecommentEntity } from './linecomment.entity';
import { LineEntity } from 'src/line/line.entity';
import { LikeService } from 'src/like/like.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LinecommentService {
  constructor(
    @InjectRepository(LinecommentEntity)
    private repository: Repository<LinecommentEntity>,
    @InjectRepository(LineEntity)
    private lineRepository: Repository<LineEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
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
    const [user, line, parent] = await Promise.all([
      this.userRepository.findOne({ where: { firebaseId: user_id } }),
      this.lineRepository.findOne({ where: { id: line_id } }),
      this.repository.findOne({
        where: { id: parent_id },
        relations: ['author'],
      }),
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
      const extra = {
        commentId: comment.id,
        content: content,
        lindId: line_id,
      };
      this.notificationService.createNotification(
        user_id,
        parent.author.firebaseId,
        NOTI_TYPE.COMMETN_REPLY,
        JSON.stringify(extra),
      );
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
