import { BookEntity } from 'src/book/book.entity';
import { RATING_TYPE } from 'src/enum';
import { LineEntity } from 'src/line/line.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
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

  @ManyToOne(() => BookEntity, (book) => book.ratings, {
    onDelete: 'CASCADE',
  })
  bookId: BookEntity;

  @OneToOne(() => LineEntity, (line) => line.rating)
  line: LineEntity;

  @ManyToOne(() => UserEntity, (user) => user.liker)
  userId: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
