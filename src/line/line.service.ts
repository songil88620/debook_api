import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LineEntity } from './line.entity';
import { LineCreateDto } from './dtos';
import { BookEntity } from 'src/book/book.entity';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(LineEntity)
    private repository: Repository<LineEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
  ) {}

  async createLine(user_id: string, data: LineCreateDto) {
    const liner = await this.userRepository.findOne({
      where: { firebaseId: user_id },
    });
    const book = await this.bookRepository.findOne({
      where: { id: data.book },
    });
    const new_line = {
      liner,
      book,
      description: data.description,
      type: data.type,
    };
    const c = this.repository.create(new_line);
    const line = await this.repository.save(c);
    return { line };
  }

  async getLines(user_id: string) {
    const lines = await this.repository.find({
      where: { liner: { firebaseId: user_id } },
    });
    return { lines };
  }
}
