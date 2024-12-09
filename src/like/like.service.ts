import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LikeEntity } from './like.entity';
import { LIKE_TYPE, NOTI_TYPE } from 'src/enum';
import { LinecommentEntity } from 'src/linecomment/linecomment.entity';
import { LineEntity } from 'src/line/line.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(LikeEntity)
    private repository: Repository<LikeEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(LinecommentEntity)
    private linecommentRepository: Repository<LinecommentEntity>,
    @InjectRepository(LineEntity)
    private lineRepository: Repository<LineEntity>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {}

  async likeOrUnlike(user_id: string, like_id: any, type: LIKE_TYPE) {
    const userPromise = this.userRepository.findOne({
      where: { firebaseId: user_id },
    });
    let likePromise: any;
    if (type == LIKE_TYPE.COMMENT) {
      likePromise = this.repository.findOne({
        where: {
          userId: { firebaseId: user_id },
          likedComment: { id: like_id },
          type,
        },
      });
    } else if (type == LIKE_TYPE.LINE) {
      likePromise = this.repository.findOne({
        where: {
          userId: { firebaseId: user_id },
          likedLine: { id: like_id },
          type,
        },
      });
    } else {
      likePromise = this.repository.findOne({
        where: {
          userId: { firebaseId: user_id },
          likedComment: { id: like_id },
          type,
        },
      });
    }
    const [user, old_like] = await Promise.all([userPromise, likePromise]);

    if (user) {
      if (old_like) {
        await this.repository.delete({ id: old_like.id });
      } else {
        let new_like: any;
        if (type == LIKE_TYPE.COMMENT) {
          const comment = await this.linecommentRepository.findOne({
            where: { id: like_id },
            relations: ['line', 'line.book'],
          });
          new_like = {
            type,
            likedComment: comment,
            userId: user,
          };
          const extra = {
            commentId: comment.id,
            lineId: comment.line.id,
            linePicture: comment.line.book.image,
          };
          this.notificationService.createNotification(
            user.firebaseId,
            comment.author.firebaseId,
            NOTI_TYPE.COMMENT_LIKE,
            JSON.stringify(extra),
          );
        } else if (type == LIKE_TYPE.LINE) {
          const line = await this.lineRepository.findOne({
            where: { id: like_id },
          });
          new_like = {
            type,
            likedLine: line,
            userId: user,
          };
        } else {
        }
        const c = this.repository.create(new_like);
        await this.repository.save(c);
      }
    } else {
      throw new BadRequestException({
        error: {
          code: 'BAD_REQUEST',
          data: null,
        },
      });
    }
  }
}
