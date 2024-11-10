import { Controller, Get, UseGuards, Param, Patch } from '@nestjs/common';
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
  async followUser(@User() user: any) {
    return await this.notificationService.getMyNotification(user.uid);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  async updateBookList(@User() user: any, @Param('id') id: number) {
    await this.notificationService.updateNotificationStatus(id, user.id);
  }
}
