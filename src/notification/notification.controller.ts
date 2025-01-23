import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { NotificationService } from './notification.service';
import { User } from 'src/user/user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: '',
  })
  async getMyNotification(@User() user: any) {
    return await this.notificationService.getMyNotification(user.uid);
  }

  @Post('readAll')
  @UseGuards(FirebaseAuthGuard)
  async readAllNotification(@User() user: any) {
    return await this.notificationService.readAllNotification(user.uid);
  }
}
