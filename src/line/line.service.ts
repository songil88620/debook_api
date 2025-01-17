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
import axios from 'axios';

@Injectable()
export class LineService {
  private compressorUrl =
    'https://di7613il5e.execute-api.eu-north-1.amazonaws.com/dev/compressVideo';

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

  async createLine(user_id: string, data: LineCreateDto, inPath: string) {
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
      file: data.file,
      thumbnail: data.thumbnail,
    };
    const c = this.repository.create(new_line);
    const line = await this.repository.save(c);
    delete line.rating.bookId;
    delete line.rating.userId;
    delete line.liner;

    this.achievementService.achieveOne(user_id, ACHIEVE_TYPE.LINE);
    this.loggerService.debug('CreateLine', line);

    // compress uploaded video by calling this compressor
    // no need to wait
    try {
      axios.post(this.compressorUrl, {
        inPath: `debook-user-data/${inPath}`,
        outPath: inPath,
      });
    } catch (error) {
      this.loggerService.error('Compressor Error', error.message);
    }

    return { line };
  }

  async getLines(user_id: string, page: number = 1, limit: number = 20) {
    const [lines, total]: any[] = await this.repository.findAndCount({
      relations: [
        'book',
        'liner',
        'rating',
        'likes',
        'likes.userId',
        'comments',
        'book.authors',
        'liner.savedBook',
        'comments.likes',
        'comments.author',
      ],
      select: {
        id: true,
        description: true,
        type: true,
        created: true,
        updated: true,
        file: true,
        thumbnail: true,
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
          authors: true,
          file: true,
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
          parentId: true,
          created: true,
          updated: true,
          likes: true,
          content: true,
          author: {
            firebaseId: true,
            firstName: true,
            lastName: true,
            photo: true,
            biography: true,
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        created: 'DESC',
      },
    });

    const linesWithData = lines.map((line) => {
      const commentCount = line.comments.length;
      const rating = line.rating.rate;
      const likeCount = line.likes.length;
      line.liner['savedBookCount'] = line.liner.savedBook.length;
      line['user'] = line.liner;
      const commentMap = new Map();
      line.comments.forEach((comment: any) => {
        if (comment.parentId == 0) {
          comment.children = [];
          commentMap.set(comment.id, comment);
        }
        comment.likes = comment.likes.length;
      });
      delete line.liner.savedBook;
      delete line.liner;
      delete line.rating;
      console.log('....', line);
      line['liked'] = false;
      line.likes.forEach((like: any) => {
        if (like.userId.firebaseId == user_id) {
          line['liked'] = true;
        }
      });
      return {
        ...line,
        likeCount,
        rating,
        commentCount,
      };
    });

    const pagination = {
      page,
      hasNext: Math.ceil(total / limit) - page > 0 ? true : false,
      limit,
    };

    this.loggerService.debug('GetLines', linesWithData);
    return { lines: linesWithData, pagination };
  }

  async getLineOne(user_id: string, line_id: number) {
    const line_one: any = await this.repository.findOne({
      where: { id: line_id },
      relations: [
        'book',
        'liner',
        'rating',
        'likes',
        'likes.userId',
        'comments',
        'book.authors',
        'liner.savedBook',
        'comments.likes',
        'comments.author',
      ],
      select: {
        id: true,
        description: true,
        type: true,
        file: true,
        thumbnail: true,
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
          authors: true,
          file: true,
        },
        liner: {
          firebaseId: true,
          firstName: true,
          lastName: true,
          photo: true,
          biography: true,
          savedBook: true,
        },
        comments: {
          id: true,
          parentId: true,
          created: true,
          updated: true,
          likes: true,
          content: true,
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
    console.log('...aaa', line_one);
    line_one['liked'] = false;
    line_one.likes.forEach((like: any) => {
      if (like.userId.firebaseId == user_id) {
        line_one['liked'] = true;
      }
    });
    // line_one.likes = line_one.likes.splice(0, 3);
    line_one.liner['savedBookCount'] = line_one.liner.savedBook.length;
    line_one['user'] = line_one.liner;
    delete line_one.liner.savedBook;
    delete line_one.liner;
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
