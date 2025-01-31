import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewhistoryEntity } from './viewhistory.entity';
import { ViewhistoryService } from './viewhistory.service';

@Module({
  imports: [TypeOrmModule.forFeature([ViewhistoryEntity])],
  controllers: [],
  providers: [ViewhistoryService],
  exports: [ViewhistoryService],
})
export class ViewhistoryModule {}
