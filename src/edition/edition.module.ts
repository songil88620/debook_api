import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditionEntity } from './edition.entity';
import { EditionService } from './edition.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EditionEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [],
  providers: [EditionService],
  exports: [EditionService],
})
export class EditionModule {}
