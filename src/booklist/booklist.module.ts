import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooklistEntity } from './booklist.entity';
import { BooklistService } from './booklist.service';
import { BooklistController } from './booklist.contoller';
import { CollaboratorModule } from 'src/collaborator/collaborator.module';
import { BookModule } from 'src/book/book.module';
import { BookEntity } from 'src/book/book.entity';
import { UserEntity } from 'src/user/user.entity';
import { CollaboratorEntity } from 'src/collaborator/collaborator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BooklistEntity,
      UserEntity,
      BookEntity,
      CollaboratorEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => CollaboratorModule),
    forwardRef(() => BookModule),
  ],
  controllers: [BooklistController],
  providers: [BooklistService],
  exports: [BooklistService],
})
export class BooklistModule {}
