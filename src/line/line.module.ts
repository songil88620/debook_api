import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LineEntity } from './line.entity';
import { LineService } from './line.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LineEntity, UserEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
