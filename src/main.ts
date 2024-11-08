import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from '@nestjs/class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (error) => {
        const errors = [];
        error.forEach((v_e: ValidationError) => {
          errors.push(v_e.property);
        });
        throw new HttpException(
          {
            error: {
              code: 'INVALID_DATA',
              data: { errors },
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      },
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('deBook API')
    .setDescription('API Documentation for deBook Backend')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(helmet());
  await app.listen(8000);
}
bootstrap();
