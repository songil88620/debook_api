import { AuthorEntity } from 'src/author/author.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { EditionEntity } from 'src/edition/edition.entity';
import { LineEntity } from 'src/line/line.entity';
import { RatingEntity } from 'src/rating/rating.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index,
} from 'typeorm';

@Entity('books')
export class BookEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @Column({ type: 'text', default: null, nullable: true })
  @Index({ fulltext: true })
  title: string;

  @Column({ type: 'text', default: null, nullable: true })
  @Index({ fulltext: true })
  summary: string;

  @Column({ type: 'text', default: null, nullable: true })
  image: string;

  @Column({ type: 'text', default: null, nullable: true })
  file: string;

  @Column({ default: true })
  public: boolean;

  @Column({ type: 'varchar', default: '[0, 0, 0, 0, 0]', length: 100 })
  rating: string;

  @Column({ default: 0 })
  seen: number;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'text', default: null, nullable: true })
  tags: string;

  @ManyToMany(() => BooklistEntity, (booklist) => booklist.books)
  booklists: BooklistEntity[];

  @ManyToMany(() => UserEntity, (user) => user.savedBook)
  saved: UserEntity[];

  @OneToMany(() => EditionEntity, (edition) => edition.book)
  editions: EditionEntity[];

  @ManyToMany(() => AuthorEntity, (author) => author.book)
  @JoinTable()
  authors: AuthorEntity[];

  @OneToMany(() => LineEntity, (lines) => lines.book)
  lines: LineEntity[];

  @OneToMany(() => RatingEntity, (rating) => rating.bookId)
  ratings: RatingEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
