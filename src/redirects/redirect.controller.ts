import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/auth/public.decorator';

@Controller('redirects')
export class RedirectController {
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
    } else {
      res.redirect(`${this.url}/(tabs)/feed`);
    }
  }
}
