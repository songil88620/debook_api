import { BookEntity } from 'src/book/book.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity('editions')
export class EditionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', default: null, nullable: true })
  title: string;

  @Column({ type: 'text', default: null, nullable: true })
  summary: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 1 })
  version: number;

  @Column({ type: 'text', default: null, nullable: true })
  editors: string;

  @Column({ type: 'text', default: null, nullable: true })
  tags: string;

  @Column({ type: 'varchar', nullable: true, length: 28, default: null })
  published_date: string;

  @Column({ type: 'text', default: null, nullable: true })
  book_file: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 1 })
  pages: number;

  @Column({ type: 'text', default: null, nullable: true })
  languages: string;

  @Column({ type: 'varchar', length: 50, default: null, nullable: true })
  reading_hour: string;

  @Column({ default: false })
  presale: boolean;

  @Column({ type: 'varchar', length: 28, default: null, nullable: true })
  presale_end: string;

  @ManyToOne(() => BookEntity, (book) => book.editions, { onDelete: 'CASCADE' })
  book: BookEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
