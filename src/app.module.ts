import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middleware/ipmiddleware';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthGuard } from './auth/auth.guard';
import { UploadModule } from './upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/user.entity';
import { InvitationEntity } from './invitation/invitation.entity';
import { AchievementEntity } from './achievement/achievement.entity';
import { AchievementModule } from './achievement/achievement.module';
import { InvitationModule } from './invitation/invitation.module';
import { FollowEntity } from './follower/follower.entity';
import { FollowModule } from './follower/follower.module';
import { EditionEntity } from './edition/edition.entity';
import { BookEntity } from './book/book.entity';
import { BooklistEntity } from './booklist/booklist.entity';
import { EditionModule } from './edition/edition.module';
import { BookModule } from './book/book.module';
import { BooklistModule } from './booklist/booklist.module';
import { CollaboratorEntity } from './collaborator/collaborator.entity';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { NotificationEntity } from './notification/notification.entity';
import { NotificationModule } from './notification/notification.module';
import { AuthorEntity } from './author/author.entity';
import { AuthorModule } from './author/author.module';
import { BookrequestEntity } from './bookrequest/bookrequest.entity';
import { BookrequestModule } from './bookrequest/bookrequest.module';
import { LineEntity } from './line/line.entity';
import { LineModule } from './line/line.module';
import { SearchModule } from './search/search.module';
import { HomeModule } from './home/home.module';
import { LinecommentModule } from './linecomment/linecomment.module';
import { LinecommentEntity } from './linecomment/linecomment.entity';
import { LikeModule } from './like/like.module';
import { LikeEntity } from './like/like.entity';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      database: 'debook_db',
      timezone: 'Z',
      entities: [
        UserEntity,
        InvitationEntity,
        AchievementEntity,
        FollowEntity,
        EditionEntity,
        BookEntity,
        BooklistEntity,
        CollaboratorEntity,
        NotificationEntity,
        AuthorEntity,
        BookrequestEntity,
        LineEntity,
        LinecommentEntity,
        LikeEntity,
      ],
      username: process.env.DB_USER,
      password: process.env.DB_PW,
      synchronize: true,
      // cache: {
      //   type: 'redis',
      //   duration: 60000,
      // },
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PassportModule,
    UploadModule,
    AchievementModule,
    InvitationModule,
    FollowModule,
    EditionModule,
    BookModule,
    BooklistModule,
    CollaboratorModule,
    NotificationModule,
    AuthorModule,
    BookrequestModule,
    LineModule,
    SearchModule,
    HomeModule,
    LinecommentModule,
    LikeModule,
    LoggerModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard
    // }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}
