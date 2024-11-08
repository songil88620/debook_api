import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.contoller';
import { AuthorModule } from 'src/author/author.module';
import { UserEntity } from 'src/user/user.entity';
import { AuthorEntity } from 'src/author/author.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookEntity, UserEntity, AuthorEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => AuthorModule),
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
