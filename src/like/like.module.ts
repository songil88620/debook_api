import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from 'src/upload/upload.module';
import { UserEntity } from 'src/user/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { LikeEntity } from './like.entity';
import { LikeService } from './like.service';
import { LinecommentEntity } from 'src/linecomment/linecomment.entity';
import { LineEntity } from 'src/line/line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LikeEntity,
      UserEntity,
      LinecommentEntity,
      LineEntity,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UploadModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
