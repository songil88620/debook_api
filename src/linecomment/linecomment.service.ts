/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
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
import { LoggerService } from 'src/logger/logger.service';

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
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  async createComment(user_id: string, line_id: number, content: string) {
    const [user, line] = await Promise.all([
      this.userRepository.findOne({ where: { firebaseId: user_id } }),
      this.lineRepository.findOne({ where: { id: line_id } }),
    ]);
    if (user && line) {
      const new_comment = {
        line,
        user,
        content,
      };
      const c = this.repository.create(new_comment);
      const comment = await this.repository.save(c);
      const extra = {
        commentId: comment.id,
        content: content,
        lindId: line_id,
      };
      this.notifyToMentionedUser(content, user_id, extra);
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
    parent_id: number,
    content: string,
  ) {
    const [user, line, parent] = await Promise.all([
      this.userRepository.findOne({ where: { firebaseId: user_id } }),
      this.lineRepository.findOne({ where: { id: line_id } }),
      this.repository.findOne({
        where: { id: parent_id },
        relations: ['user'],
      }),
    ]);
    if (user && line) {
      const new_comment = {
        line,
        user,
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
        parent.user.firebaseId,
        NOTI_TYPE.COMMETN_REPLY,
        JSON.stringify(extra),
      );
      this.notifyToMentionedUser(content, user_id, extra);
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

  async likeOrUnlikeComment(user_id: string, like_id: any, type: LIKE_TYPE) {
    await this.likeService.likeOrUnlike(user_id, like_id, type);
  }

  async getComments(line_id: number, user_id: string) {
    // eslint-disable-next-line prefer-const
    let [comments, totalCount] = await this.repository.findAndCount({
      where: { line: { id: line_id } },
      relations: ['user', 'likes', 'likes.user'],
      select: {
        id: true,
        user: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
          username: true,
        },
        content: true,
        parentId: true,
        likes: {
          id: true,
          user: {
            firebaseId: true,
            firstName: true,
            lastName: true,
            username: true,
            photo: true,
          },
        },
        created: true,
        updated: true,
      },
      order: { created: 'DESC' },
    });
    const commentMap = new Map();
    comments.forEach((comment: any) => {
      if (comment.parentId == 0) {
        comment.children = [];
      }
      commentMap.set(comment.id, comment);
      comment['liked'] = false;
      comment.likes.forEach((lk: any) => {
        if (lk.user.firebaseId == user_id) {
          comment['liked'] = true;
        }
      });
      comment['likeCount'] = comment.likes.length;
    });

    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parentId === 0) {
        nestedComments.push(comment);
      } else {
        let currentParent = commentMap.get(comment.parentId);
        const topParent = currentParent;
        while (currentParent && currentParent.parentId !== 0) {
          currentParent = commentMap.get(currentParent.parentId);
        }
        if (topParent != currentParent) {
          comment['replyTo'] = currentParent.user;
        }
        if (currentParent) {
          currentParent.children.push(comment);
        }
      }
    });

    comments = nestedComments;
    this.loggerService.debug('GetComments', comments);
    return { comments, totalCount };
  }

  async deleteComment(lind_id: number, comment_id: number, user_id: string) {
    const comment = await this.repository.findOne({
      where: {
        id: comment_id,
        user: { firebaseId: user_id },
        line: { id: lind_id },
      },
    });
    if (comment) {
      await this.repository.delete({ id: comment_id });
      throw new HttpException({ message: 'success' }, HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async notifyToMentionedUser(
    message: string,
    notifier: string,
    extra: object,
  ) {
    const usernameRegex = /@(\w+)/g;
    const names = [];
    let match;
    while ((match = usernameRegex.exec(message)) !== null) {
      names.push(match[1]);
    }
    for (const username of names) {
      const user = await this.userRepository.findOne({ where: { username } });
      if (user) {
        this.notificationService.createNotification(
          notifier,
          user.firebaseId,
          NOTI_TYPE.COMMETN_MENTIONED,
          JSON.stringify(extra),
        );
      }
    }
  }
}
