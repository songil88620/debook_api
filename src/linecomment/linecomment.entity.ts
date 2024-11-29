import { LikeEntity } from 'src/like/like.entity';
import { LineEntity } from 'src/line/line.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity('linecomments')
export class LinecommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.linecommentor, {
    onDelete: 'CASCADE',
  })
  author: UserEntity;

  @ManyToOne(() => LineEntity, (line) => line.comments, {
    onDelete: 'CASCADE',
  })
  line: LineEntity;

  @Column({ type: 'text', nullable: true, default: null })
  content: string;

  @Column({ default: 0 })
  parentId: number;

  @OneToMany(() => LikeEntity, (like) => like.likedComment)
  likes: LikeEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
