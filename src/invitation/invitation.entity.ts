import { INVITATION_STATUS_TYPE } from 'src/enum';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity('invitations')
export class InvitationEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.inviter, { onDelete: 'CASCADE' })
  inviter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.invitee, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  invitee: UserEntity | null;

  @Column({ type: 'varchar', length: 100 })
  inviteePhoneNumber: string;

  @Column({
    type: 'enum',
    enum: INVITATION_STATUS_TYPE,
    default: INVITATION_STATUS_TYPE.PENDING,
  })
  status: INVITATION_STATUS_TYPE;

  @OneToOne(() => UserEntity, (user) => user.invitation)
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
