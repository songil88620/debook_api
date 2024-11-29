import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { AuthorEntity } from 'src/author/author.entity';
import { HomeController } from './home.contoller';
import { HomeService } from './home.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BookEntity,
      BooklistEntity,
      AuthorEntity,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
