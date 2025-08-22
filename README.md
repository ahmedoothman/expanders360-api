# Expanders360 API

## Description

Expanders360 is a comprehensive vendor matching platform built with NestJS, designed to help businesses find and connect with the right service providers globally. The platform features advanced matching algorithms, document management, analytics, and real-time notifications.

## Features

- **User Management**: Client and admin role-based authentication
- **Vendor Management**: Comprehensive vendor profiles with country and service coverage
- **Project Management**: Client project creation with service requirements and budgets
- **Smart Matching**: AI-powered vendor-project matching based on location, services, and ratings
- **Document Management**: MongoDB-based document storage with full-text search
- **Analytics**: Advanced analytics for vendor performance and matching insights
- **Notifications**: Real-time email notifications for matches and updates
- **Scheduled Tasks**: Automated daily match refreshing and SLA monitoring

## Tech Stack

- **Backend**: NestJS (Node.js)
- **Databases**:
  - MySQL (User data, projects, vendors, matches)
  - MongoDB (Documents, research files)
  - Redis (Caching, sessions)
- **Authentication**: JWT with Passport
- **Email**: Nodemailer
- **Validation**: class-validator
- **ORM**: TypeORM (MySQL) + Mongoose (MongoDB)
- **Task Scheduling**: @nestjs/schedule
- **File Upload**: Multer
- **Containerization**: Docker & docker-compose

## Project Setup

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- MySQL 8.0
- MongoDB 6.0
- Redis 7

### Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd expanders360-api
```

2. Install dependencies:

```bash
npm install
```

3. Start the databases using Docker:

```bash
npm run docker:up
```

4. Copy the environment file:

```bash
cp .env.example .env
```

5. Seed the database:

```bash
npm run seed
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Vendors

- `GET /vendors` - Get all vendors (with filtering)
- `GET /vendors/:id` - Get vendor by ID
- `POST /vendors` - Create vendor
- `PATCH /vendors/:id` - Update vendor
- `DELETE /vendors/:id` - Delete vendor
- `GET /vendors?country=<country>` - Filter by country
- `GET /vendors?service=<service>` - Filter by service

### Projects

- `GET /projects` - Get all projects (with filtering)
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects?client_id=<id>` - Filter by client
- `GET /projects?status=<status>` - Filter by status
- `GET /projects?country=<country>` - Filter by country

### Matches

- `GET /matches/project/:projectId` - Get matches for project
- `POST /matches/rebuild/:projectId` - Rebuild matches for project
- `GET /matches/analytics/top-vendors` - Get top vendors by country

### Documents

- `GET /documents/project/:projectId` - Get documents for project
- `POST /documents` - Create document
- `POST /documents/upload` - Upload document with file
- `GET /documents/search?query=<term>` - Search documents
- `GET /documents/search?tags=<tag1,tag2>` - Search by tags

### Analytics

- `GET /analytics/top-vendors` - Get analytics dashboard data

### Notifications

- `POST /notifications/test/:projectId` - Send test notification

## Database Schema

### MySQL Tables

- **users** (clients) - User accounts with roles
- **vendors** - Service provider profiles
- **projects** - Client project requirements
- **matches** - Vendor-project matching results

### MongoDB Collections

- **research_docs** - Documents and files with full-text search

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Docker Deployment

The application includes full Docker support:

```bash
# Start all services (MySQL, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Environment Variables

See `.env.example` for all required configuration options:

- Database connections (MySQL, MongoDB, Redis)
- JWT secrets and expiration
- Email SMTP configuration
- Application port and environment

## Development

### Code Quality

- ESLint configuration with TypeScript support
- Prettier for code formatting
- Automatic validation with class-validator
- TypeScript strict mode enabled

### Scripts

```bash
npm run format    # Format code with Prettier
npm run lint      # Lint and fix code issues
npm run seed      # Seed database with sample data
npm run docker:up # Start Docker services
npm run docker:down # Stop Docker services
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is UNLICENSED.
