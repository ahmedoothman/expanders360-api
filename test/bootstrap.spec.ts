import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Application Bootstrap Test', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should bootstrap the application successfully', () => {
    expect(app).toBeDefined();
  });
});
