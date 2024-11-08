import { STATUS_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('invitation')
export class InvitationEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.inviter, { onDelete: 'CASCADE' })
  inviter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.invitee, { onDelete: 'CASCADE' })
  invitee: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  inviteePhoneNumber: string;

  @Column({ type: 'enum', enum: STATUS_TYPE, default: STATUS_TYPE.PENDING })
  status: STATUS_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
