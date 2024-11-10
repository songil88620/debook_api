import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InvitationEntity } from './invitation.entity';
import { UserDto } from 'src/user/dtos';
import { uuid } from 'uuidv4';
import { InvitaionDto } from './dtos';
import { UserEntity } from 'src/user/user.entity';
import { addHours, isBefore } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
import { STATUS_TYPE } from 'src/enum';

@Injectable()
export class InvitationService {
  private twilioClient;
  private twilioPhoneNumber;

  constructor(
    @InjectRepository(InvitationEntity)
    private repository: Repository<InvitationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      this.twilioPhoneNumber = process.env.TWILO_NUMBER;
    } catch (e) {
      console.log('twillio', e);
    }
  }

  async onModuleInit() {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'status check bot' })
  async runStatusCheckBot() {
    this.checkStatusByTime();
  }

  async sendInvitation(uid: string, phone: string) {
    let invite_status = STATUS_TYPE.PENDING;

    // A user with influencer role will have unlimited invitations
    // A user can not invite another user without invitations available.
    const user: UserDto = await this.userRepository.findOne({
      where: { firebaseId: uid },
    });
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
      where: { inviteePhoneNumber: phone, status: STATUS_TYPE.ACCEPTED },
    });
    if (accepted_invitation) {
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

    // A user who is using app and already invited cannot be invited again
    const alreay_in_user = await this.userRepository.findOne({
      where: { phoneNumber: phone },
    });
    if (alreay_in_user && accepted_invitation) {
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
    // A user who is using app and wasn't invited before can be invited immediatelly and accepted status
    if (alreay_in_user && accepted_invitation == null) {
      invite_status = STATUS_TYPE.ACCEPTED;
    }

    const invitation_msg = `${user?.firstName} ${user?.lastName} has invited you to Debook`;
    const tw_res = await this.sendInvitionViaPhone(phone, invitation_msg);
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
        status: invite_status,
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
      const invitaions = await this.repository.find({
        where: {
          inviter: { firebaseId: uid },
          status: In(['accepted', 'pending']),
        },
        relations: ['invitee'],
      });
      const ivs = invitaions.map((invitation) => ({
        ...invitation,
        currentTime,
      }));
      return { invitations: ivs };
    } catch (e) {
      return { invitations: [] };
    }
  }

  // get one invitaion by using id
  async getOneInvitation(invitationId: string) {
    const currentTime = new Date();
    const invitation = await this.repository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.inviter', 'inviter')
      .where('invitation.id = :id', { id: invitationId })
      .select([
        'invitation.id',
        'invitation.status',
        'invitation.created',
        'inviter.firebaseId',
        'inviter.firstName',
        'inviter.lastName',
      ])
      .getOne();
    return { invitation: { ...invitation, currentTime } };
  }

  async acceptInvitationById(
    id: string,
    inviteeId: string,
    phoneNumber: string,
  ) {
    const iv = await this.repository.findOne({
      where: { id, status: STATUS_TYPE.PENDING },
    });
    if (iv) {
      const expirationTime = addHours(iv.created, 48);
      const isExpired = isBefore(expirationTime, new Date());
      if (!isExpired) {
        await this.repository.update(
          { id },
          { invitee: { firebaseId: inviteeId }, status: STATUS_TYPE.ACCEPTED },
        );
        // A user can only accept one invitation at a time. As soon as one invitation is accepted, the rest will be declined
        await this.repository.update(
          { inviteePhoneNumber: phoneNumber, status: STATUS_TYPE.PENDING },
          { status: STATUS_TYPE.DECLINED },
        );

        //TODO do something to notify for inviter

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
      where: { inviteePhoneNumber, status: STATUS_TYPE.PENDING },
    });
    if (invited) {
      const invitee = await this.userRepository.findOne({
        where: { firebaseId: inviteeId },
      });
      await this.repository.update(
        { inviteePhoneNumber },
        { invitee, status: STATUS_TYPE.ACCEPTED },
      );
    }
  }

  // send invitation via twillo api
  async sendInvitionViaPhone(phoneNumber: string, invitation_msg: string) {
    try {
      await this.twilioClient.messages.create({
        body: invitation_msg,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async followOnOff(follower: string, followee: string) {
    await this.repository.findOne({
      where: {
        inviter: { firebaseId: follower },
        invitee: { firebaseId: followee },
        status: STATUS_TYPE.ACCEPTED,
      },
    });
  }

  // The expiration will be determined through the created at column. An invitation has an expiration of 48 hours.
  async checkStatusByTime() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    await this.repository
      .createQueryBuilder('invitation')
      .update()
      .set({ status: STATUS_TYPE.EXPIRED })
      .where('status = :status', { status: 'pending' })
      .andWhere('created < :twoDaysAgo', { twoDaysAgo })
      .execute();
  }

  // get invitation ranking
  async getInvitationRank() {
    const ranking = await this.repository
      .createQueryBuilder('invitation')
      .select('invitation.inviter.firebaseId', 'inviterId')
      .addSelect('COUNT(invitation.inviter.firebaseId)', 'cnt')
      .groupBy('invitation.inviter.firebaseId')
      .orderBy('cnt', 'DESC')
      .leftJoinAndSelect('invitation.inviter', 'inviter')
      .getRawMany();
    const invitationRanking = ranking.map((r: any) => {
      return {
        inviterId: r.inviterId,
        firstName: r.inviter_firstName,
        lastName: r.inviter_lastName,
        photo: r.inviter_photo,
        email: r.inviter_email,
        phone: r.inviter_phoneNumber,
        count: r.cnt,
      };
    });
    return { invitationRanking };
  }
}
