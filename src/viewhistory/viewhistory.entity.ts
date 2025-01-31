import { VIEW_TYPE } from 'src/enum';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('viewhistory')
export class ViewhistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: VIEW_TYPE,
    default: VIEW_TYPE.LINE,
  })
  type: VIEW_TYPE;

  // @ManyToOne(() => UserEntity, (user) => user.viewer)
  // user_id: UserEntity;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ default: 0 })
  viewId: number;

  @Column({ type: 'timestamp', nullable: false })
  lastView: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
