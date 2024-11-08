import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookrequestService } from './bookrequest.service';
import { BookrequestEntity } from './bookrequest.entity';
import { BookrequestController } from './bookrequest.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookrequestEntity, UserEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BookrequestController],
  providers: [BookrequestService],
  exports: [BookrequestService],
})
export class BookrequestModule {}
