import { BookEntity } from 'src/book/book.entity';
import { LINE_TYPE } from 'src/enum';
import { LikeEntity } from 'src/like/like.entity';
import { LinecommentEntity } from 'src/linecomment/linecomment.entity';
import { RatingEntity } from 'src/rating/rating.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('lines')
export class LineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.liner, { onDelete: 'CASCADE' })
  liner: UserEntity;

  @ManyToOne(() => BookEntity, (book) => book.lines, { onDelete: 'CASCADE' })
  book: BookEntity;

  @OneToMany(() => LinecommentEntity, (comments) => comments.line)
  comments: LinecommentEntity[];

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @OneToOne(() => RatingEntity, (ratings) => ratings.line)
  rating: RatingEntity;

  @Column({ type: 'enum', enum: LINE_TYPE, default: LINE_TYPE.VIDEO })
  type: LINE_TYPE;

  @OneToMany(() => LikeEntity, (like) => like.likedLine)
  likes: LikeEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
