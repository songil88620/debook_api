import { NOTI_STATUS_TYPE, NOTI_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity('notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.notifier, { onDelete: 'CASCADE' })
  notifier: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.notifiee, { onDelete: 'CASCADE' })
  notifiee: UserEntity;

  @Column({ type: 'enum', enum: NOTI_TYPE, default: NOTI_TYPE.DEBOOK })
  type: NOTI_TYPE;

  @Column({ type: 'text', default: null, nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: NOTI_STATUS_TYPE,
    default: NOTI_STATUS_TYPE.PENDING,
  })
  status: NOTI_STATUS_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
