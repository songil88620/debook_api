import { BooklistEntity } from 'src/booklist/booklist.entity';
import { STATUS_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity('collaborator')
export class CollaboratorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BooklistEntity, (booklist) => booklist.collaborators, {
    onDelete: 'CASCADE',
  })
  booklist: BooklistEntity;

  @ManyToOne(() => UserEntity, (user) => user.collaborations, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ type: 'enum', enum: STATUS_TYPE, default: STATUS_TYPE.PENDING })
  status: STATUS_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
