import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller('link')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @Redirect(
    'debook:///(protected)/main/book/0009ebde-b2e7-479c-8737-67acbc3f8ac3',
    302,
  )
  getLink() {
    return;
  }
}
