import { BookEntity } from 'src/book/book.entity';

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity('authors')
export class AuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  @Index({ unique: true })
  author_id: number;

  @Column({ type: 'varchar', nullable: true, default: null, length: 50 })
  @Index({ fulltext: true })
  name: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: 50 })
  photo: string;

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => BookEntity, (book) => book.authors, { onDelete: 'CASCADE' })
  book: BookEntity;

  // @ManyToOne(() => UserEntity, (user) => user.authors, { onDelete: 'CASCADE' })
  // user: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
