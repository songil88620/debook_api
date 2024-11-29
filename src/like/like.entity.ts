import { LIKE_TYPE } from 'src/enum';
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

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LIKE_TYPE,
    default: LIKE_TYPE.NONE,
  })
  type: LIKE_TYPE;

  @ManyToOne(() => LinecommentEntity, (likeComment) => likeComment.likes, {
    onDelete: 'CASCADE',
  })
  likedComment: LinecommentEntity;

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
