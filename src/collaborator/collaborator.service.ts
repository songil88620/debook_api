import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaboratorEntity } from './collaborator.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { UserEntity } from 'src/user/user.entity';
import { STATUS_TYPE } from 'src/enum';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(CollaboratorEntity)
    private repository: Repository<CollaboratorEntity>,
    @InjectRepository(BooklistEntity)
    private booklistRepository: Repository<BooklistEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async inviteCollaborators(booklist_id: string, collaborators: string[]) {
    const booklist = await this.booklistRepository.findOne({
      where: { id: booklist_id },
    });
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
    });
    if (cl) {
      await this.repository.update(
        { id: cl.id },
        { status: status ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.REJECTED },
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
    status: STATUS_TYPE,
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
}
