import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import { BookrequestEntity } from './bookrequest.entity';
import { UserEntity } from 'src/user/user.entity';
import { RequesterCreateDto } from './dtos';

@Injectable()
export class BookrequestService {
  constructor(
    @InjectRepository(BookrequestEntity)
    private repository: Repository<BookrequestEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createOne(requester_id: string, data: RequesterCreateDto) {
    const requester = await this.userRepository.findOne({
      where: { firebaseId: requester_id },
    });
    const nr = {
      id: uuid(),
      ...data,
      requester: requester,
    };
    const c = this.repository.create(nr);
    const bookRequest = await this.repository.save(c);
    return { bookRequest };
  }

  async getAll(requester_id: string) {
    const bookRequest = await this.repository.find({
      where: { requester: { firebaseId: requester_id } },
    });
    return { bookRequest };
  }
}
