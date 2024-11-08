import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { STATUS_TYPE } from 'src/enum';

@Entity('bookrequest')
export class BookrequestEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  id: string;

  @Column({ type: 'varchar', default: null, length: 100 })
  author_name?: string;

  @Column({ type: 'text', default: null, nullable: true })
  title?: string;

  @Column({ type: 'text', default: null, nullable: true })
  description?: string;

  @Column({ type: 'text', default: null, nullable: true })
  file?: string;

  @ManyToOne(() => UserEntity, (user) => user.requester, {
    onDelete: 'CASCADE',
  })
  requester?: UserEntity;

  @Column({ type: 'enum', enum: STATUS_TYPE, default: STATUS_TYPE.PENDING })
  status: STATUS_TYPE;

  @CreateDateColumn({ type: 'timestamp' })
  created?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated?: Date;
}
