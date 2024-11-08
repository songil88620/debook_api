import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditionEntity } from './edition.entity';

@Injectable()
export class EditionService {
  constructor(
    @InjectRepository(EditionEntity)
    private repository: Repository<EditionEntity>,
  ) {}
}
