import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LineEntity } from './line.entity';
import { LineCreateDto } from './dtos';
import { BookEntity } from 'src/book/book.entity';
import { AchievementService } from 'src/achievement/achievement.service';
import { ACHIEVE_TYPE, LIKE_TYPE } from 'src/enum';
import { LikeService } from 'src/like/like.service';
import { LoggerService } from 'src/logger/logger.service';
import { RatingEntity } from 'src/rating/rating.entity';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(LineEntity)
    private repository: Repository<LineEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
    @Inject(forwardRef(() => LikeService))
    private likeService: LikeService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {}

  async createLine(user_id: string, data: LineCreateDto) {
    const [liner, book] = await Promise.all([
      this.userRepository.findOne({
        where: { firebaseId: user_id },
      }),
      this.bookRepository.findOne({
        where: { id: data.book },
      }),
    ]);
    if (!book) {
      throw new BadRequestException({
        error: {
          code: 'BAD_REQUEST',
          data: null,
        },
      });
    }

    const rating = new RatingEntity();
    rating.bookId = book;
    rating.userId = liner;
    rating.rate = data.rating;

    const new_line = {
      liner,
      book,
      description: data.description,
      type: data.type,
      rating: rating,
    };
    const c = this.repository.create(new_line);
    const line = await this.repository.save(c);
    delete line.rating.bookId;
    delete line.rating.userId;
    delete line.liner;

    this.achievementService.achieveOne(user_id, ACHIEVE_TYPE.LINE);
    this.loggerService.debug('CreateLine', line);
    return { line };
  }

  async getLines(user_id: string) {
    const lines: any[] = await this.repository.find({
      where: { liner: { firebaseId: user_id } },
      relations: ['book', 'liner', 'rating', 'likes', 'comments'],
      select: {
        id: true,
        description: true,
        type: true,
        created: true,
        updated: true,
        book: {
          id: true,
          title: true,
          image: true,
          summary: true,
          seen: true,
        },
        liner: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
          biography: true,
        },
        rating: {
          rate: true,
        },
        comments: {
          id: true,
        },
      },
    });

    const linesWithData = lines.map((line) => {
      const commentCount = line.comments.length;
      const rating = line.rating.rate;
      const likeCount = line.likes.length;
      delete line.comments;
      delete line.rating;
      delete line.likes;
      return {
        ...line,
        likeCount,
        rating,
        commentCount,
      };
    });

    this.loggerService.debug('GetLines', linesWithData);
    return { lines: linesWithData };
  }

  async getLineOne(user_id: string, line_id: number) {
    const line_one: any = await this.repository.findOne({
      where: { id: line_id },
      relations: [
        'liner',
        'book',
        'likes',
        'likes.userId',
        'comments',
        'comments.likes',
        'comments.author',
        'rating',
      ],
      select: {
        id: true,
        description: true,
        type: true,
        created: true,
        updated: true,
        rating: {
          rate: true,
        },
        likes: {
          id: true,
          userId: {
            firebaseId: true,
            photo: true,
            firstName: true,
            lastName: true,
          },
        },
        book: {
          id: true,
          title: true,
          image: true,
          summary: true,
          seen: true,
        },
        liner: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
          biography: true,
        },
        comments: {
          id: true,
          parentId: true,
          created: true,
          updated: true,
          likes: true,
          author: {
            firebaseId: true,
            firstName: true,
            lastName: true,
            photo: true,
            biography: true,
          },
        },
      },
    });

    line_one['commentCount'] = line_one.comments.length;
    line_one['likeCount'] = line_one.likes.length;
    line_one.rating = line_one.rating.rate;
    delete line_one.rating;
    line_one.likes = line_one.likes.splice(0, 3);
    const commentMap = new Map();
    line_one.comments.forEach((comment: any) => {
      if (comment.parentId == 0) {
        comment.children = [];
        commentMap.set(comment.id, comment);
      }
      comment.likes = comment.likes.length;
    });
    const nestedComments = [];
    line_one.comments.forEach((comment) => {
      if (comment.parentId === 0) {
        nestedComments.push(comment);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(comment);
        }
      }
    });
    line_one.comments = nestedComments;
    this.loggerService.debug('GetLineOne', line_one);
    return { line: line_one };
  }

  async likeOrUnlike(user_id: string, line_id: number) {
    await this.likeService.likeOrUnlike(user_id, line_id, LIKE_TYPE.LINE);
  }
}
