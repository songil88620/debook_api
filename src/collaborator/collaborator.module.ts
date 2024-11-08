import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaboratorEntity } from './collaborator.entity';
import { CollaboratorService } from './collaborator.service';
import { BooklistModule } from 'src/booklist/booklist.module';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { UserEntity } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaboratorEntity, BooklistEntity, UserEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => BooklistModule),
  ],
  controllers: [],
  providers: [CollaboratorService],
  exports: [CollaboratorService],
})
export class CollaboratorModule {}
