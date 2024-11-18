import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaboratorEntity } from './collaborator.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { UserEntity } from 'src/user/user.entity';
import { NOTI_MESSAGES, NOTI_TYPE, INVITATION_STATUS_TYPE } from 'src/enum';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(CollaboratorEntity)
    private repository: Repository<CollaboratorEntity>,
    @InjectRepository(BooklistEntity)
    private booklistRepository: Repository<BooklistEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async inviteCollaborators(booklist_id: string, collaborators: string[]) {
    const booklist = await this.booklistRepository.findOne({
      where: { id: booklist_id },
    });
    const inviter = await this.userRepository.findOne({
      where: { firebaseId: booklist.owner_id },
    });
    const inviter_name = inviter.firstName + ' ' + inviter.lastName;
    const booklist_name = booklist.title;
    const msg = NOTI_MESSAGES.INVITE_BOOKLIST_COLLABORATOR.replace(
      '$NAME',
      inviter_name,
    ).replace('$BOOKLIST', booklist_name);

    for (const cl of collaborators) {
      const user = await this.userRepository.findOne({
        where: { firebaseId: cl },
      });
      const new_collaborator = {
        booklist: booklist,
        user,
      };
      const c = this.repository.create(new_collaborator);
      await this.repository.save(c);
      this.notificationService.createNotification(
        booklist.owner_id,
        cl,
        NOTI_TYPE.COLLABORATOR,
        msg,
      );
    }
  }

  async acceptCollaborator(
    booklist_id: string,
    collaborator_id: string,
    status: boolean,
  ) {
    const cl = await this.repository.findOne({
      where: {
        user: { firebaseId: collaborator_id },
        booklist: { id: booklist_id },
      },
      relations: ['user'],
    });
    if (cl) {
      await this.repository.update(
        { id: cl.id },
        {
          status: status
            ? INVITATION_STATUS_TYPE.ACCEPTED
            : INVITATION_STATUS_TYPE.REJECTED,
        },
      );
      const booklist = await this.booklistRepository.findOne({
        where: { id: booklist_id },
      });
      const collaborator_name = cl.user.firstName + ' ' + cl.user.lastName;
      const msg =
        status == true
          ? NOTI_MESSAGES.ACCEPT_BOOKLIST_COLLABORATOR.replace(
              '$NAME',
              collaborator_name,
            )
          : NOTI_MESSAGES.REJECT_BOOKLIST_COLLABORATOR.replace(
              '$NAME',
              collaborator_name,
            );
      this.notificationService.createNotification(
        collaborator_id,
        booklist.owner_id,
        NOTI_TYPE.COLLABORATOR,
        msg,
      );
    } else {
      throw new HttpException(
        { error: { code: 'FORBIDDEN' } },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async checkCollaboratorStatus(
    cid: string,
    collaborator_id: string,
    status: INVITATION_STATUS_TYPE,
  ) {
    const c = await this.repository.findOne({
      where: {
        user: { firebaseId: collaborator_id },
        booklist: { id: cid },
        status,
      },
    });
    return c ? true : false;
  }

  // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
  async getCollaborators(
    userid: string,
    name: string,
    page: number,
    limit: number,
  ) {}
}
