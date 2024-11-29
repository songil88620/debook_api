import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { INVITATION_STATUS_TYPE } from 'src/enum';

@Entity('bookrequests')
export class BookrequestEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @Column({ type: 'varchar', default: null, length: 100 })
  authorName?: string;

  @Column({ type: 'text', default: null, nullable: true })
  @Index({ fulltext: true })
  title?: string;

  @Column({ type: 'text', default: null, nullable: true })
  @Index({ fulltext: true })
  description?: string;

  @Column({ type: 'text', default: null, nullable: true })
  file?: string;

  @ManyToOne(() => UserEntity, (user) => user.requester, {
    onDelete: 'CASCADE',
  })
  requester?: UserEntity;

  @Column({
    type: 'enum',
    enum: INVITATION_STATUS_TYPE,
    default: INVITATION_STATUS_TYPE.PENDING,
  })
  status: INVITATION_STATUS_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated?: Date;
}
