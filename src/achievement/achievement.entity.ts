import { ACHIEVE_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('achievements')
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.achiever, { onDelete: 'CASCADE' })
  achiever: UserEntity;

  @Column({ default: 0 })
  done: number;

  @Column({ type: 'enum', enum: ACHIEVE_TYPE, default: ACHIEVE_TYPE.NONE })
  type: ACHIEVE_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
