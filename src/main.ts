import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Apply global response interceptor for consistent response format
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Apply global exception filter for consistent error format
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS for frontend integration
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) =>
  console.error('Application failed to start:', error),
);
