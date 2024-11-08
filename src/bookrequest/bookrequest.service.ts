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

  async createOne(requester_id: string, bookRequest: RequesterCreateDto) {
    const requester = await this.userRepository.findOne({
      where: { firebaseId: requester_id },
    });
    const nr = {
      id: uuid(),
      ...bookRequest,
      requester: requester,
    };
    const c = this.repository.create(nr);
    return await this.repository.save(c);
  }

  async getAll(requester_id: string) {
    return await this.repository.find({
      where: { requester: { firebaseId: requester_id } },
    });
  }
}
