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
import { UploadModule } from 'src/upload/upload.module';
import { AchievementModule } from 'src/achievement/achievement.module';
import { LoggerModule } from 'src/logger/logger.module';

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
    forwardRef(() => UploadModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [BooklistController],
  providers: [BooklistService],
  exports: [BooklistService],
})
export class BooklistModule {}
