import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UploadModule } from 'src/upload/upload.module';
import { InvitationModule } from 'src/invitation/invitation.module';
import { LoggerModule } from 'src/logger/logger.module';
import { LineEntity } from 'src/line/line.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { BookEntity } from 'src/book/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      LineEntity,
      BooklistEntity,
      BookEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UploadModule),
    forwardRef(() => InvitationModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
