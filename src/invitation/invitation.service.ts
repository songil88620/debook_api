import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { InvitationEntity } from './invitation.entity';
import { UserDto } from 'src/user/dtos';
import { uuid } from 'uuidv4';
import { InvitaionDto } from './dtos';
import { UserEntity } from 'src/user/user.entity';
import { addHours, isBefore } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NOTI_MESSAGES, NOTI_TYPE, INVITATION_STATUS_TYPE } from 'src/enum';
import { NotificationService } from 'src/notification/notification.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class InvitationService {
  private twilioClient;
  private twilioPhoneNumber;

  constructor(
    @InjectRepository(InvitationEntity)
    private repository: Repository<InvitationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      this.twilioPhoneNumber = process.env.TWILO_NUMBER;
    } catch (error) {
      this.loggerService.error('TwilloInitError', error);
    }
  }

  async onModuleInit() {
    // this.sendSMSviaPhone('+17607903430', 'test messgae');
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'status check bot' })
  async runStatusCheckBot() {
    this.checkStatusByTime();
  }

  async sendInvitation(uid: string, phone: string) {
    // A user with influencer role will have unlimited invitations
    // A user can not invite another user without invitations available.
    const user: UserDto = await this.userRepository.findOne({
      where: { firebaseId: uid },
    });

    // user can't send invitation by himself
    if (user.phoneNumber == phone) {
      this.loggerService.warn(
        'SendInvitation',
        'User can not send inviation by himself',
      );
      throw new HttpException(
        {
          error: {
            code: 'YOU_CAN_NOT_INVITE_YOURSELF',
            data: null,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // check user's remaining invitation count
    if (user.invitationsRemainingCount == 0 && user.role == 'user') {
      throw new HttpException(
        {
          error: {
            code: 'NO_INVITATIONS_AVAILABLE',
            data: null,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // A user can be invited by more than one person.
    // If the user has already accepted an invitation, he can not be invited again
    const accepted_invitation = await this.repository.findOne({
      where: {
        inviteePhoneNumber: phone,
        status: INVITATION_STATUS_TYPE.ACCEPTED,
      },
    });
    if (accepted_invitation) {
      this.loggerService.warn('SendInvitation', 'Already invited phone number');
      throw new HttpException(
        {
          error: {
            code: 'PHONE_NUMBER_ALREADY_INVITED',
            data: null,
          },
        },
        HttpStatus.CONFLICT,
      );
    }

    const msg = `${user?.firstName} ${user?.lastName} has invited you to Debook`;
    const tw_res = await this.sendSMSviaPhone(phone, msg);
    if (tw_res) {
      // When sending an invitation, it should be subtracted from the count in the user table
      if (user.role == 'user') {
        await this.userRepository.update(
          { firebaseId: uid },
          { invitationsRemainingCount: user.invitationsRemainingCount - 1 },
        );
      }
      const inviter = await this.userRepository.findOne({
        where: { firebaseId: uid },
      });
      const new_invitation: InvitaionDto = {
        id: uuid(),
        inviter: inviter,
        invitee: null,
        inviteePhoneNumber: phone,
        status: INVITATION_STATUS_TYPE.PENDING,
      };
      const c = this.repository.create(new_invitation);
      return await this.repository.save(c);
    } else {
      throw new HttpException(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            data: null,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get all invitation and invitee's user detail data for a user
  async getInvitations(uid: string) {
    try {
      const currentTime = new Date();
      const invitations = await this.repository
        .createQueryBuilder('invitations')
        .leftJoinAndSelect('invitations.inviter', 'inviter')
        .leftJoinAndSelect('invitations.inviter', 'invitee')
        .select([
          'invitations.id',
          'invitations.inviteePhoneNumber',
          'invitations.status',
          'invitations.created',
          'invitations.updated',
          'inviter.firebaseId',
          'inviter.firstName',
          'inviter.lastName',
          'inviter.photo',
          'invitee.firebaseId',
          'invitee.firstName',
          'invitee.lastName',
          'invitee.photo',
        ])
        .where('inviter.firebaseId = :uid', { uid })
        .andWhere('invitations.status IN (:...statuses)', {
          statuses: [
            INVITATION_STATUS_TYPE.ACCEPTED,
            INVITATION_STATUS_TYPE.PENDING,
          ],
        })
        .getMany();
      const ivs = invitations.map((invitation) => ({
        ...invitation,
        currentTime,
      }));
      this.loggerService.debug('GetInvitations', ivs);
      return { invitations: ivs };
    } catch (error) {
      this.loggerService.error('GetInvitationsError', error);
      return { invitations: [] };
    }
  }

  async getInvitationsByPhoneNumber(phoneNumber: string) {
    return {
      invitations: await this.repository
        .createQueryBuilder('invitations')
        .leftJoinAndSelect('invitations.inviter', 'inviter')
        .where('invitations.inviteePhoneNumber = :phoneNumber', { phoneNumber })
        .andWhere('invitations.status = :status', {
          status: INVITATION_STATUS_TYPE.PENDING,
        })
        .select([
          'invitations',
          'inviter.firstName',
          'inviter.lastName',
          'inviter.photo',
        ])
        .getMany(),
    };
  }

  // get one invitaion by using id
  async getOneInvitation(invitationId: string) {
    const currentTime = new Date();

    const invitation = await this.repository
      .createQueryBuilder('invitations')
      .leftJoinAndSelect('invitations.inviter', 'inviter')
      .where('invitations.id = :id', { id: invitationId })
      .select([
        'invitations.id',
        'invitations.status',
        'invitations.created',
        'inviter.firstName',
        'inviter.lastName',
        'inviter.photo',
      ])
      .getOne();
    this.loggerService.debug('GetOneInvitation', invitation);
    return {
      invitation: {
        ...invitation,
        currentTime,
      },
    };
  }

  async acceptInvitationById(
    invitationId: string,
    userId: string,
    phoneNumber: string,
  ) {
    const invitation = await this.repository.preload({
      id: invitationId,
      status: INVITATION_STATUS_TYPE.PENDING,
    });

    if (!invitation) {
      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          data: null,
        },
      });
    }

    const expirationTime = addHours(invitation.created, 48);
    const isExpired = isBefore(expirationTime, new Date());

    if (isExpired) {
      throw new BadRequestException({
        error: {
          code: 'INVITATION_EXPIRED',
          data: null,
        },
      });
    }

    invitation.status = INVITATION_STATUS_TYPE.ACCEPTED;
    await this.repository.save(invitation);

    const [, , accepted_invitation] = await Promise.all([
      // A user can only accept one invitation at a time. As soon as one invitation is accepted, the rest will be declined
      this.repository.update(
        {
          inviteePhoneNumber: phoneNumber,
          status: INVITATION_STATUS_TYPE.PENDING,
          id: Not(invitationId),
        },
        { status: INVITATION_STATUS_TYPE.DECLINED },
      ),

      this.userRepository.update(
        { firebaseId: userId },
        { invitation: invitation },
      ),

      this.repository.findOne({
        where: { id: invitation.id },
        relations: ['inviter'],
        select: {
          id: true,
          created: true,
          updated: true,
          status: true,
          inviter: {
            firebaseId: true,
            photo: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            username: true,
            biography: true,
          },
        },
      }),
    ]);

    return { acceptedInvitation: accepted_invitation };

    // TODO later

    // // notify to the accepted user
    // this.notificationService.createNotification(
    //   invitation.invitee.firebaseId,
    //   userId,
    //   NOTI_TYPE.INVITATION,
    //   NOTI_MESSAGES.INVITATION_ACCEPTED,
    // );

    // // notify to the declined user
    // const declinee = await this.repository.find({
    //   where: {
    //     inviteePhoneNumber: phoneNumber,
    //     status: INVITATION_STATUS_TYPE.DECLINED,
    //   },
    // });

    // declinee.forEach((d: any) => {
    //   const notifier = invitation.inviter.firebaseId;
    //   const notifiee = d.invitee.firebaseId;
    //   this.notificationService.createNotification(
    //     notifier,
    //     notifiee,
    //     NOTI_TYPE.INVITATION,
    //     NOTI_MESSAGES.INVITATION_DECLINED,
    //   );
    // });
  }

  async declineInvitationById(
    id: string,
    inviteeId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    phoneNumber: string,
  ) {
    const iv = await this.repository.findOne({
      where: { id, status: INVITATION_STATUS_TYPE.PENDING },
    });
    if (iv) {
      const expirationTime = addHours(iv.created, 48);
      const isExpired = isBefore(expirationTime, new Date());
      if (!isExpired) {
        await this.repository.update(
          { id },
          {
            invitee: { firebaseId: inviteeId },
            status: INVITATION_STATUS_TYPE.DECLINED,
          },
        );

        // notify to the declined user
        this.notificationService.createNotification(
          iv.inviter.firebaseId,
          inviteeId,
          NOTI_TYPE.INVITATION,
          NOTI_MESSAGES.INVITATION_DECLINED,
        );

        throw new HttpException(
          { message: 'The invitation was successfully accepted' },
          HttpStatus.NO_CONTENT,
        );
      } else {
        throw new HttpException(
          {
            error: {
              code: 'INVITATION_EXPIRED',
              data: null,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        {
          error: {
            code: 'NOT_FOUND',
            data: null,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async acceptInvitationByPhonenumber(
    inviteePhoneNumber: string,
    inviteeId: string,
  ) {
    const invited = await this.repository.findOne({
      where: { inviteePhoneNumber, status: INVITATION_STATUS_TYPE.PENDING },
    });
    if (invited) {
      const invitee = await this.userRepository.findOne({
        where: { firebaseId: inviteeId },
      });
      await this.repository.update(
        { inviteePhoneNumber },
        { invitee, status: INVITATION_STATUS_TYPE.ACCEPTED },
      );
    }
  }

  // send invitation via twillo api
  async sendSMSviaPhone(phoneNumber: string, msg: string) {
    try {
      await this.twilioClient.messages.create({
        body: msg,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      this.loggerService.error('TwilloSmsError', error);
      return false;
    }
  }

  async followOnOff(follower: string, followee: string) {
    await this.repository.findOne({
      where: {
        inviter: { firebaseId: follower },
        invitee: { firebaseId: followee },
        status: INVITATION_STATUS_TYPE.ACCEPTED,
      },
    });
  }

  // The expiration will be determined through the created at column. An invitation has an expiration of 48 hours.
  async checkStatusByTime() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    await this.repository
      .createQueryBuilder('invitations')
      .update()
      .set({ status: INVITATION_STATUS_TYPE.EXPIRED })
      .where('status = :status', { status: 'pending' })
      .andWhere('created < :twoDaysAgo', { twoDaysAgo })
      .execute();
  }

  // get invitation ranking
  async getInvitationRank() {
    const ranking = await this.repository
      .createQueryBuilder('invitations')
      .select('invitations.invitee.firebaseId', 'inviteeId')
      .addSelect('COUNT(invitations.invitee.firebaseId)', 'cnt')
      .groupBy('invitations.invitee.firebaseId')
      .orderBy('cnt', 'DESC')
      .leftJoinAndSelect('invitations.invitee', 'invitee')
      .getRawMany();
    const invitationRanking = ranking.map((r: any) => {
      return {
        inviteeId: r.inviteeId,
        firstName: r.invitee_firstName,
        lastName: r.invitee_lastName,
        photo: r.invitee_photo,
        email: r.invitee_email,
        phone: r.invitee_phoneNumber,
        count: r.cnt,
      };
    });
    return { invitationRanking };
  }
}
