/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LIKE_TYPE, NOTI_TYPE } from 'src/enum';
import { LinecommentEntity } from './linecomment.entity';
import { LineEntity } from 'src/line/line.entity';
import { LikeService } from 'src/like/like.service';
import { NotificationService } from 'src/notification/notification.service';
import { LoggerService } from 'src/logger/logger.service';
import { reverse } from 'dns';

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
        lineId: line_id,
      };
      this.notifyToMentionedUser(content, user_id, extra, comment.id);
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
    if (user && line && parent) {
      // check tree deep level
      let pid = parent_id;
      if (parent.parentId == 0) {
        pid = parent_id;
      } else {
        const gParent = await this.repository.findOne({
          where: { id: parent.parentId },
        });
        if (gParent.parentId == 0) {
          pid = parent_id;
        } else {
          pid = gParent.id;
        }
      }
      const new_comment = {
        line,
        user,
        content,
        parentId: pid,
      };
      const c = this.repository.create(new_comment);
      const comment = await this.repository.save(c);
      const extra = {
        commentId: comment.id,
        content: content,
        lineId: line_id,
      };
      this.notificationService.createNotification(
        user_id,
        parent.user.firebaseId,
        NOTI_TYPE.COMMETN_REPLY,
        JSON.stringify(extra),
        `c_${comment.id}`,
      );
      this.notifyToMentionedUser(content, user_id, extra, comment.id);
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
    await Promise.all(
      comments.map(async (comment: any) => {
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
        const taggedUsers = [];
        const content = comment.content;
        const usernameRegex = /@(\w+)/g;
        const names = [];
        let match;
        while ((match = usernameRegex.exec(content)) !== null) {
          names.push(match[1]);
        }
        for (const username of names) {
          const user = await this.userRepository.findOne({
            where: { username },
            select: {
              firebaseId: true,
              username: true,
            },
          });
          if (user) {
            taggedUsers.push(user);
          }
        }
        comment['taggedUsers'] = taggedUsers;
      }),
    );

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
          comment['replyTo'] = currentParent?.user;
        }
        if (currentParent) {
          currentParent.children.push(comment);
        }
      }
    });

    nestedComments.forEach((comment) => {
      comment['children'] = comment['children']?.reverse();
    });

    comments = nestedComments;
    //this.loggerService.debug('GetComments', comments);
    return { comments, totalCount };
  }

  async deleteComment(line_id: number, comment_id: number, user_id: string) {
    const comment = await this.repository.findOne({
      where: {
        id: comment_id,
        user: { firebaseId: user_id },
        line: { id: line_id },
      },
    });

    if (comment) {
      if (comment.parentId == 0) {
        const replies = await this.repository.find({
          where: {
            parentId: comment_id,
            line: { id: line_id },
          },
          select: {
            id: true,
          },
        });
        const replyIds = replies.map((reply) => reply.id);
        // get children replies
        const secReplies = await this.repository.find({
          where: { parentId: In(replyIds), line: { id: line_id } },
          select: {
            id: true,
          },
        });
        const secReplyIds = secReplies.map((reply) => reply.id);
        const delIds = [...replyIds, ...secReplyIds];
        await this.repository.delete({ id: In(delIds), line: { id: line_id } });
        const removeNotificationList = [
          ...replyIds.map((r) => 'c_' + r),
          ...secReplyIds.map((r) => 'c_' + r),
        ];
        this.notificationService.deleteReplyNotification(
          removeNotificationList,
        );
      } else {
        // get children replies
        const secReplies = await this.repository.find({
          where: { parentId: comment_id, line: { id: line_id } },
          select: { id: true },
        });
        const secReplyIds = secReplies.map((reply) => reply.id);
        // delete children replies
        await this.repository.delete({
          id: In(secReplyIds),
          line: { id: line_id },
        });
        const removeNotificationList = [
          ...secReplyIds.map((r) => 'c_' + r),
          ...[`c_${comment_id}`],
        ];
        this.notificationService.deleteReplyNotification(
          removeNotificationList,
        );
      }
      // delete comment
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
    comment_id: number,
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
          `c_${comment_id}`,
        );
      }
    }
  }

  async deleteCommentOfLine(line_id: number) {
    await this.repository.delete({ line: { id: line_id } });
  }
}
