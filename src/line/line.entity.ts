import { BookEntity } from 'src/book/book.entity';
import { LINE_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lines')
export class LineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.liner, { onDelete: 'CASCADE' })
  liner: UserEntity;

  @ManyToOne(() => BookEntity, (book) => book.lines, { onDelete: 'CASCADE' })
  book: BookEntity;

  // @ManyToOne(() => BookEntity, (book) => book.lines, { onDelete: 'CASCADE' })
  // comment: BookEntity;

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @Column({ type: 'varchar', default: '[0, 0, 0, 0, 0]', length: 100 })
  rating: string;

  @Column({ type: 'enum', enum: LINE_TYPE, default: LINE_TYPE.VIDEO })
  type: LINE_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
