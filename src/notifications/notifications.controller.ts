import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test/:projectId')
  async testNotification(@Param('projectId', ParseIntPipe) projectId: number) {
    await this.notificationsService.sendMatchNotification(projectId, []);
    return { message: 'Test notification sent' };
  }
}
