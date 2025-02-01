import { AchievementEntity } from 'src/achievement/achievement.entity';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { BookrequestEntity } from 'src/bookrequest/bookrequest.entity';
import { CollaboratorEntity } from 'src/collaborator/collaborator.entity';
import { ONBOARDING_STATUS } from 'src/enum';
import { FollowEntity } from 'src/follower/follower.entity';
import { InvitationEntity } from 'src/invitation/invitation.entity';
import { LikeEntity } from 'src/like/like.entity';
import { LineEntity } from 'src/line/line.entity';
import { LinecommentEntity } from 'src/linecomment/linecomment.entity';
import { NotificationEntity } from 'src/notification/notification.entity';
// import { ViewhistoryEntity } from 'src/viewhistory/viewhistory.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 36 })
  @Index({ fulltext: true })
  firebaseId: string;

  @Column({ type: 'text', nullable: true, default: null })
  biography: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    default: null,
  })
  email: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: 30 })
  @Index({ fulltext: true })
  firstName: string;

  @OneToOne(() => InvitationEntity, (invitation) => invitation.user, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  invitation: InvitationEntity | null;

  @Column({ default: 5 })
  invitationsRemainingCount: number;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'varchar', nullable: true, default: null, length: 30 })
  @Index({ fulltext: true })
  lastName: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: 100 })
  locale: string;

  @Column({ type: 'varchar', default: '', length: 100 })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: 200 })
  photo: string;

  @Column({ type: 'varchar', default: 'user', length: 10 })
  role: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
    default: null,
  })
  username: string;

  @Column({ type: 'varchar', default: '#000000', length: 9 })
  backgroundColor: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({
    type: 'enum',
    enum: ONBOARDING_STATUS,
    default: ONBOARDING_STATUS.INIT,
  })
  onboardingStatus: ONBOARDING_STATUS;

  @ManyToMany(() => BooklistEntity, (booklist) => booklist.saved)
  savedBooklists: BooklistEntity[];

  @ManyToMany(() => BookEntity, (booklist) => booklist.saved)
  @JoinTable()
  savedBook: BookEntity[];

  @OneToMany(() => CollaboratorEntity, (collaborator) => collaborator.user)
  collaborations: CollaboratorEntity[];

  // @OneToMany(() => AuthorEntity, (author) => author.user)
  // authors: AuthorEntity[];

  @OneToMany(() => FollowEntity, (follower) => follower.follower)
  follower: FollowEntity[];

  @OneToMany(() => FollowEntity, (followee) => followee.followee)
  followee: FollowEntity[];

  @OneToMany(() => InvitationEntity, (inviter) => inviter.inviter)
  inviter: InvitationEntity[];

  @OneToMany(() => InvitationEntity, (invitee) => invitee.invitee)
  invitee: InvitationEntity[];

  @OneToMany(() => NotificationEntity, (notifier) => notifier.notifier)
  notifier: NotificationEntity[];

  @OneToMany(() => NotificationEntity, (notifiee) => notifiee.notifiee)
  notifiee: NotificationEntity[];

  @JoinTable()
  @OneToMany(() => BookrequestEntity, (requester) => requester.requester)
  requester: BookrequestEntity[];

  @JoinTable()
  @OneToMany(() => AchievementEntity, (achiever) => achiever.achiever)
  achiever: AchievementEntity[];

  @JoinTable()
  @OneToMany(() => LineEntity, (liner) => liner.user)
  lines: LineEntity[];

  @JoinTable()
  @OneToMany(() => LinecommentEntity, (linecomment) => linecomment.user)
  linecommentor: LinecommentEntity[];

  @JoinTable()
  @OneToMany(() => LikeEntity, (rater) => rater.user)
  rater: LikeEntity[];

  @JoinTable()
  @OneToMany(() => LikeEntity, (liker) => liker.user)
  liker: LikeEntity[];

  // @JoinTable()
  // @OneToMany(() => ViewhistoryEntity, (liker) => liker.user)
  // viewer: ViewhistoryEntity[];

  @JoinTable()
  @OneToMany(() => BooklistEntity, (booklist) => booklist.user)
  booklistOwner: BooklistEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
