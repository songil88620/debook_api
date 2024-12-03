import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { RatingEntity } from './rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private repository: Repository<RatingEntity>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {}
}
