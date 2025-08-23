import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        mysql: !!(
          process.env.DATABASE_URL ||
          process.env.DATABASE_HOST ||
          process.env.MYSQLHOST
        ),
        mongodb: !!(process.env.MONGODB_URL || process.env.MONGODB_URI),
      },
    };
  }
}
