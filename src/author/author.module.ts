import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from './author.entity';
import { AuthorService } from './author.service';
import { BookModule } from 'src/book/book.module';
import { BookEntity } from 'src/book/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorEntity, BookEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => BookModule),
  ],
  controllers: [],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
