import { BookEntity } from 'src/book/book.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity('author')
export class AuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BookEntity, (book) => book.authors, { onDelete: 'CASCADE' })
  book: BookEntity;

  @ManyToOne(() => UserEntity, (user) => user.authors, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
