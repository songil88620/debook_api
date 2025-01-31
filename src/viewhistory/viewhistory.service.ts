import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewhistoryEntity } from './viewhistory.entity';

@Injectable()
export class ViewhistoryService {
  constructor(
    @InjectRepository(ViewhistoryEntity)
    private repository: Repository<ViewhistoryEntity>,
  ) {}

  async onModuleInit() {}
}
