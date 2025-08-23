import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { VendorsModule } from './vendors/vendors.module';
import { MatchesModule } from './matches/matches.module';
import { DocumentsModule } from './documents/documents.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // Railway provides DATABASE_URL or individual MySQL variables
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // Parse the DATABASE_URL provided by Railway
          return {
            type: 'mysql',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
            ssl:
              process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        } else {
          // Fallback to individual environment variables
          return {
            type: 'mysql',
            host:
              configService.get<string>('DATABASE_HOST') ||
              configService.get<string>('MYSQLHOST'),
            port:
              parseInt(configService.get<string>('DATABASE_PORT') || '3306') ||
              parseInt(configService.get<string>('MYSQLPORT') || '3306'),
            username:
              configService.get<string>('DATABASE_USERNAME') ||
              configService.get<string>('MYSQLUSER'),
            password:
              configService.get<string>('DATABASE_PASSWORD') ||
              configService.get<string>('MYSQLPASSWORD'),
            database:
              configService.get<string>('DATABASE_NAME') ||
              configService.get<string>('MYSQLDATABASE'),
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
            ssl:
              process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        }
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const mongoUri =
          configService.get<string>('MONGODB_URL') ||
          configService.get<string>('MONGODB_URI');

        return {
          uri: mongoUri,
          // Additional options for production
          ...(process.env.NODE_ENV === 'production' && {
            retryWrites: true,
            w: 'majority',
          }),
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ProjectsModule,
    VendorsModule,
    MatchesModule,
    DocumentsModule,
    AnalyticsModule,
    NotificationsModule,
    TasksModule,
  ],
})
export class AppModule {}
