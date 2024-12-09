import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from 'src/upload/upload.module';
import { InvitationEntity } from './invitation.entity';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.contoller';
import { UserEntity } from 'src/user/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationEntity, UserEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UploadModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => LoggerModule),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
