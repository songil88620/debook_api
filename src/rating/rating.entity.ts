import { BookEntity } from 'src/book/book.entity';
import { RATING_TYPE } from 'src/enum';
import { LineEntity } from 'src/line/line.entity';
import { LinecommentEntity } from 'src/linecomment/linecomment.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity('ratings')
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RATING_TYPE,
    default: RATING_TYPE.BOOK,
  })
  type: RATING_TYPE;

  @ManyToOne(() => LinecommentEntity, (likeComment) => likeComment.likes, {
    onDelete: 'CASCADE',
  })
  bookId: BookEntity;

  @ManyToOne(() => LineEntity, (likedLine) => likedLine.likes, {
    onDelete: 'CASCADE',
  })
  likedLine: LineEntity;

  @ManyToOne(() => UserEntity, (user) => user.liker)
  userId: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
