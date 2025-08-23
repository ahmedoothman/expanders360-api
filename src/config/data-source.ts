import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get('DATABASE_HOST') || 'localhost',
  port: parseInt(configService.get('DATABASE_PORT') || '3307'),
  username: configService.get('DATABASE_USERNAME') || 'othman',
  password: configService.get('DATABASE_PASSWORD') || 'othmanpassword',
  database: configService.get('DATABASE_NAME') || 'expanders360',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  logging: true,
});

export default AppDataSource;
