import {
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/auth/public.decorator';
import { LineService } from 'src/line/line.service';

@Controller('redirects')
export class RedirectController {
  constructor(
    @Inject(forwardRef(() => LineService))
    private lineService: LineService,
  ) {}

  private readonly url = 'debook:///(protected)/main';

  @Get(':type/:id')
  @Public()
  getRedirection(
    @Param('type') type: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    if (type === 'book') {
      res.redirect(`${this.url}/book/${id}`);
    } else if (type === 'profile') {
      res.redirect(`${this.url}/(tabs)/profile/${id}`);
    } else if (type === 'line') {
      this.lineService.increaseSharedCount(Number(id));
      res.redirect(`${this.url}/(tabs)/lines?lineId=${id}`);
    } else {
      res.redirect(`${this.url}/(tabs)/feed`);
    }
  }
}
