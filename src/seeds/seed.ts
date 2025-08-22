import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { ProjectsService } from '../projects/projects.service';
import { UserRole } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const vendorsService = app.get(VendorsService);
  const projectsService = app.get(ProjectsService);

  // Seed users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const client1 = await usersService.create({
    company_name: 'TechCorp Inc',
    contact_email: 'admin@techcorp.com',
    password: hashedPassword,
    role: UserRole.CLIENT,
  });

  const admin = await usersService.create({
    company_name: 'Expanders360',
    contact_email: 'admin@expanders360.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  // Seed vendors
  await vendorsService.create({
    name: 'Global Business Solutions',
    countries_supported: ['Germany', 'France', 'Italy'],
    services_offered: ['legal', 'accounting', 'compliance'],
    rating: 4.5,
    response_sla_hours: 12,
  });

  // Seed projects
  await projectsService.create({
    client_id: client1.id,
    country: 'Germany',
    services_needed: ['legal', 'accounting'],
    budget: 50000,
    status: 'active',
  });

  console.log('✅ Database seeded successfully!');
  await app.close();
}

bootstrap();
