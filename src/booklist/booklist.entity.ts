import { BookEntity } from 'src/book/book.entity';
import { CollaboratorEntity } from 'src/collaborator/collaborator.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  Generated,
} from 'typeorm';

@Entity('booklists')
export class BooklistEntity {
  @Generated('uuid')
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @Column({ type: 'text', default: null, nullable: true })
  title: string;

  @Column({ type: 'text', default: null, nullable: true })
  summary: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: 200 })
  image: string;

  @Column({ type: 'varchar', length: 36 })
  ownerId: string;

  @Column({ default: true })
  public: boolean;

  @Column({ default: 0 })
  liked: number;

  @ManyToMany(() => BookEntity, (book) => book.booklists)
  @JoinTable()
  books: BookEntity[];

  @ManyToMany(() => UserEntity, (user) => user.savedBooklists)
  saved: UserEntity[];

  @OneToMany(() => CollaboratorEntity, (collaborator) => collaborator.booklist)
  collaborators: CollaboratorEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
