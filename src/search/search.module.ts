import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.contoller';
import { BookEntity } from 'src/book/book.entity';
import { BooklistEntity } from 'src/booklist/booklist.entity';
import { AuthorEntity } from 'src/author/author.entity';

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
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
