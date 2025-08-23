# Expanders360 API

A comprehensive NestJS-based API for vendor-project matching that intelligently connects clients with optimal vendors based on services, geographic location, and performance metrics.

## 🌟 Overview

Expanders360 API is designed to streamline the vendor selection process for businesses by providing:

- **Smart Matching Algorithm**: Sophisticated scoring system to match projects with ideal vendors
- **Global Coverage**: Multi-country vendor database with location-based filtering
- **Performance Tracking**: Comprehensive analytics and vendor rating system
- **Document Management**: Secure file handling for project documentation
- **Real-time Notifications**: Automated email alerts for key events

## 🚀 Key Features

- **User Management**: Secure client registration with OTP-based email verification
- **Project Lifecycle**: Complete project creation, tracking, and management workflow
- **Vendor Database**: Comprehensive vendor profiles with services, ratings, and SLA metrics
- **Intelligent Matching**: Advanced algorithm considering service overlap, ratings, and response times
- **Document Storage**: MongoDB-based document management with search capabilities
- **Analytics Dashboard**: Performance insights and vendor ranking analytics
- **Notification System**: Automated email notifications for project updates

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **Docker & Docker Compose**: For containerized deployment
- **MySQL**: 8.0 for relational data
- **MongoDB**: 6.0 for document storage
- **SMTP Service**: For email notifications (Gmail recommended)

## 🛠️ Setup & Installation

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/ahmedoothman/expanders360-api.git
cd expanders360-api

# Install dependencies
npm install
```

### 2. Environment Configuration

Create and configure your environment file:

```bash
cp .env.example .env
```

**Essential Environment Variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration (MySQL)
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USERNAME=othman
DATABASE_PASSWORD=othmanpassword
DATABASE_NAME=expanders360

# Document Storage (MongoDB)
MONGODB_URI=mongodb://mongo_user:mongo_pass@localhost:27017/expanders360_docs?authSource=admin

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Application Settings
ADMIN_EMAIL=admin@expanders360.com
APP_NAME=Expanders360
FRONTEND_URL=http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,png,txt

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Check service status
docker-compose ps

# Stop all services
docker-compose down
```

### 4. Local Development Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start development server with hot reload
npm run start:dev

# Alternative: Start in debug mode
npm run start:debug
```

### 5. Health Check

Verify your installation:

```bash
# API Health Check
curl http://localhost:3000/api/v1/health

# Database Connection Check
curl http://localhost:3000/api/v1/health/database
```

## 📊 Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Project : creates
    Project ||--o{ Match : "generates matches for"
    Vendor ||--o{ Match : "participates in"
    Project ||--o{ Document : "contains documents"
    User ||--o{ Notification : "receives"

    User {
        int id PK
        string company_name "NOT NULL"
        string contact_email UK "UNIQUE, NOT NULL"
        string password "HASHED, NOT NULL"
        enum role "DEFAULT: client"
        string phone
        string address
        string reset_password_otp
        datetime otp_expires_at
        string email_verification_otp
        datetime email_otp_expires_at
        boolean is_email_verified "DEFAULT: false"
        boolean is_active "DEFAULT: true"
        datetime last_login
        datetime created_at
        datetime updated_at
    }

    Project {
        int id PK
        string title "NOT NULL"
        text description
        string country "NOT NULL"
        json services_needed "NOT NULL"
        decimal budget "DECIMAL(15,2)"
        enum status "DEFAULT: active"
        enum priority "DEFAULT: medium"
        date deadline
        int client_id FK "NOT NULL"
        json additional_requirements
        datetime created_at
        datetime updated_at
    }

    Vendor {
        int id PK
        string name "NOT NULL, UNIQUE"
        text description
        json countries_supported "NOT NULL"
        json services_offered "NOT NULL"
        decimal rating "DECIMAL(3,2), DEFAULT: 0.00"
        int total_projects "DEFAULT: 0"
        int response_sla_hours "DEFAULT: 24"
        string contact_email
        string phone
        string website
        json certifications
        boolean is_active "DEFAULT: true"
        datetime created_at
        datetime updated_at
    }

    Match {
        int id PK
        int project_id FK "NOT NULL"
        int vendor_id FK "NOT NULL"
        decimal score "DECIMAL(5,2), NOT NULL"
        json score_breakdown
        enum status "DEFAULT: pending"
        text notes
        datetime created_at
        datetime updated_at
    }

    Document {
        string id PK "UUID"
        string filename "NOT NULL"
        string originalname "NOT NULL"
        string mimetype "NOT NULL"
        int size "NOT NULL"
        string project_id FK "NOT NULL"
        string uploaded_by FK
        json metadata
        boolean is_active "DEFAULT: true"
        datetime uploadDate
        datetime updated_at
    }

    Notification {
        int id PK
        int user_id FK "NOT NULL"
        string title "NOT NULL"
        text message "NOT NULL"
        enum type "NOT NULL"
        json data
        boolean is_read "DEFAULT: false"
        datetime created_at
    }
```

### Database Indexes

**Performance Optimization Indexes:**

```sql
-- Users table
CREATE INDEX idx_users_email ON users(contact_email);
CREATE INDEX idx_users_active ON users(is_active);

-- Projects table
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_country ON projects(country);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created ON projects(created_at);

-- Vendors table
CREATE INDEX idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_sla ON vendors(response_sla_hours);

-- Matches table
CREATE UNIQUE INDEX idx_matches_project_vendor ON matches(project_id, vendor_id);
CREATE INDEX idx_matches_score ON matches(score DESC);
CREATE INDEX idx_matches_project ON matches(project_id);

-- Documents table
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_active ON documents(is_active);
```

## 🔧 API Endpoints Reference

### Base URL Structure

```
Production: https://api.expanders360.com/api/v1
Staging: https://staging-api.expanders360.com/api/v1
Development: http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                               | Description                    | Auth | Rate Limit |
| ------ | -------------------------------------- | ------------------------------ | ---- | ---------- |
| POST   | `/api/v1/auth/register`                | Register new client account    | ❌   | 5/15min    |
| POST   | `/api/v1/auth/login`                   | Authenticate user              | ❌   | 10/15min   |
| POST   | `/api/v1/auth/logout`                  | Logout user (invalidate token) | ✅   | 10/15min   |
| POST   | `/api/v1/auth/refresh`                 | Refresh JWT token              | ✅   | 20/15min   |
| POST   | `/api/v1/auth/forgot-password`         | Request password reset OTP     | ❌   | 3/15min    |
| POST   | `/api/v1/auth/verify-registration-otp` | Verify email with OTP          | ❌   | 5/15min    |
| POST   | `/api/v1/auth/resend-verification-otp` | Resend email verification OTP  | ❌   | 3/15min    |
| POST   | `/api/v1/auth/reset-password`          | Reset password with OTP        | ❌   | 5/15min    |
| PUT    | `/api/v1/auth/update-password`         | Update password                | ✅   | 5/15min    |

### User Management

| Method | Endpoint                | Description               | Auth | Permissions |
| ------ | ----------------------- | ------------------------- | ---- | ----------- |
| GET    | `/api/v1/users`         | Get all users (paginated) | ✅   | Admin       |
| GET    | `/api/v1/users/profile` | Get current user profile  | ✅   | User        |
| GET    | `/api/v1/users/:id`     | Get user by ID            | ✅   | Admin/Owner |
| PUT    | `/api/v1/users/:id`     | Update user profile       | ✅   | Admin/Owner |
| DELETE | `/api/v1/users/:id`     | Deactivate user account   | ✅   | Admin       |
| GET    | `/api/v1/users/stats`   | Get user statistics       | ✅   | Admin       |

### Project Management

| Method | Endpoint                               | Description                 | Auth | Permissions |
| ------ | -------------------------------------- | --------------------------- | ---- | ----------- |
| POST   | `/api/v1/projects`                     | Create new project          | ✅   | Client      |
| GET    | `/api/v1/projects`                     | Get projects (with filters) | ✅   | User        |
| GET    | `/api/v1/projects/:id`                 | Get project details         | ✅   | Owner/Admin |
| PUT    | `/api/v1/projects/:id`                 | Update project              | ✅   | Owner/Admin |
| DELETE | `/api/v1/projects/:id`                 | Delete project              | ✅   | Owner/Admin |
| GET    | `/api/v1/projects/:id/matches`         | Get project matches         | ✅   | Owner/Admin |
| POST   | `/api/v1/projects/:id/matches/rebuild` | Rebuild project matches     | ✅   | Owner/Admin |
| GET    | `/api/v1/projects/:id/documents`       | Get project documents       | ✅   | Owner/Admin |
| GET    | `/api/v1/projects/:id/analytics`       | Get project analytics       | ✅   | Owner/Admin |

### Vendor Management

| Method | Endpoint                       | Description                | Auth | Permissions |
| ------ | ------------------------------ | -------------------------- | ---- | ----------- |
| POST   | `/api/v1/vendors`              | Create new vendor          | ✅   | Admin       |
| GET    | `/api/v1/vendors`              | Get vendors (with filters) | ✅   | User        |
| GET    | `/api/v1/vendors/:id`          | Get vendor details         | ✅   | User        |
| PUT    | `/api/v1/vendors/:id`          | Update vendor information  | ✅   | Admin       |
| DELETE | `/api/v1/vendors/:id`          | Deactivate vendor          | ✅   | Admin       |
| GET    | `/api/v1/vendors/:id/projects` | Get vendor project history | ✅   | Admin       |
| PUT    | `/api/v1/vendors/:id/rating`   | Update vendor rating       | ✅   | Admin       |
| GET    | `/api/v1/vendors/search`       | Advanced vendor search     | ✅   | User        |

### Match Management

| Method | Endpoint                             | Description             | Auth | Permissions |
| ------ | ------------------------------------ | ----------------------- | ---- | ----------- |
| GET    | `/api/v1/matches/project/:projectId` | Get matches for project | ✅   | Owner/Admin |
| GET    | `/api/v1/matches/vendor/:vendorId`   | Get matches for vendor  | ✅   | Admin       |
| PUT    | `/api/v1/matches/:id/status`         | Update match status     | ✅   | Owner/Admin |
| GET    | `/api/v1/matches/:id/details`        | Get detailed match info | ✅   | Owner/Admin |

### Document Management

| Method | Endpoint                               | Description              | Auth | Permissions |
| ------ | -------------------------------------- | ------------------------ | ---- | ----------- |
| POST   | `/api/v1/documents`                    | Create document metadata | ✅   | User        |
| POST   | `/api/v1/documents/upload`             | Upload document file     | ✅   | User        |
| GET    | `/api/v1/documents/search`             | Search documents         | ✅   | User        |
| GET    | `/api/v1/documents/project/:projectId` | Get project documents    | ✅   | Owner/Admin |
| GET    | `/api/v1/documents/:id`                | Get document details     | ✅   | Owner/Admin |
| GET    | `/api/v1/documents/:id/download`       | Download document        | ✅   | Owner/Admin |
| DELETE | `/api/v1/documents/:id`                | Delete document          | ✅   | Owner/Admin |

### Analytics & Reports

| Method | Endpoint                               | Description                    | Auth | Permissions |
| ------ | -------------------------------------- | ------------------------------ | ---- | ----------- |
| GET    | `/api/v1/analytics/dashboard`          | Get dashboard analytics        | ✅   | User        |
| GET    | `/api/v1/analytics/top-vendors`        | Get top vendors by country     | ✅   | User        |
| GET    | `/api/v1/analytics/project-trends`     | Get project creation trends    | ✅   | Admin       |
| GET    | `/api/v1/analytics/match-statistics`   | Get matching success rates     | ✅   | Admin       |
| GET    | `/api/v1/analytics/vendor-performance` | Get vendor performance metrics | ✅   | Admin       |

### Notification Management

| Method | Endpoint                                | Description                 | Auth | Permissions |
| ------ | --------------------------------------- | --------------------------- | ---- | ----------- |
| GET    | `/api/v1/notifications`                 | Get user notifications      | ✅   | User        |
| PUT    | `/api/v1/notifications/:id/read`        | Mark notification as read   | ✅   | Owner       |
| PUT    | `/api/v1/notifications/mark-all-read`   | Mark all notifications read | ✅   | User        |
| POST   | `/api/v1/notifications/test/:projectId` | Send test notification      | ✅   | Admin       |

### System Health & Info

| Method | Endpoint                  | Description                 | Auth | Permissions |
| ------ | ------------------------- | --------------------------- | ---- | ----------- |
| GET    | `/api/v1/health`          | API health status           | ❌   | Public      |
| GET    | `/api/v1/health/database` | Database connectivity       | ❌   | Public      |
| GET    | `/api/v1/info`            | API version & info          | ❌   | Public      |
| GET    | `/api/v1/docs`            | API documentation (Swagger) | ❌   | Public      |

## 🧮 Enhanced Matching Algorithm

### Algorithm Overview

The Expanders360 matching system employs a multi-factor scoring algorithm that evaluates vendors across several dimensions:

```typescript
interface MatchingFactors {
  serviceAlignment: number; // 0-10 scale
  geographicMatch: number; // 0-5 scale
  performanceRating: number; // 0-5 scale
  responseCapability: number; // 0-3 scale
  budgetCompatibility: number; // 0-2 scale
}

interface MatchScore {
  totalScore: number;
  breakdown: MatchingFactors;
  confidence: number; // 0-100%
}
```

### Core Scoring Formula

```typescript
function calculateEnhancedMatchScore(
  vendor: Vendor,
  project: Project,
): MatchScore {
  const factors = {
    serviceAlignment: calculateServiceAlignment(
      vendor.services_offered,
      project.services_needed,
    ),
    geographicMatch: calculateGeographicMatch(
      vendor.countries_supported,
      project.country,
    ),
    performanceRating: vendor.rating,
    responseCapability: calculateResponseScore(vendor.response_sla_hours),
    budgetCompatibility: calculateBudgetScore(
      vendor.typical_budget_range,
      project.budget,
    ),
  };

  // Weighted scoring system
  const weights = {
    serviceAlignment: 0.35, // 35% - Most important
    performanceRating: 0.25, // 25% - Quality indicator
    geographicMatch: 0.2, // 20% - Operational feasibility
    responseCapability: 0.12, // 12% - Client service
    budgetCompatibility: 0.08, // 8% - Financial alignment
  };

  const totalScore =
    factors.serviceAlignment * weights.serviceAlignment +
    factors.performanceRating * weights.performanceRating +
    factors.geographicMatch * weights.geographicMatch +
    factors.responseCapability * weights.responseCapability +
    factors.budgetCompatibility * weights.budgetCompatibility;

  const confidence = calculateConfidence(factors);

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: factors,
    confidence: Math.round(confidence),
  };
}
```

### Detailed Scoring Components

#### 1. Service Alignment (0-10 scale)

```typescript
function calculateServiceAlignment(
  vendorServices: string[],
  projectNeeds: string[],
): number {
  const exactMatches = projectNeeds.filter((need) =>
    vendorServices.includes(need),
  ).length;

  const partialMatches = calculatePartialMatches(vendorServices, projectNeeds);

  const totalNeeds = projectNeeds.length;
  const alignmentRatio = (exactMatches + partialMatches * 0.5) / totalNeeds;

  return Math.min(10, alignmentRatio * 10);
}
```

#### 2. Geographic Compatibility (0-5 scale)

```typescript
function calculateGeographicMatch(
  supportedCountries: string[],
  projectCountry: string,
): number {
  if (supportedCountries.includes(projectCountry)) return 5.0;
  if (
    supportedCountries.includes('Global') ||
    supportedCountries.includes('Worldwide')
  )
    return 4.5;

  // Check regional proximity
  const regionalScore = calculateRegionalProximity(
    supportedCountries,
    projectCountry,
  );
  return regionalScore;
}
```

#### 3. Response Capability (0-3 scale)

```typescript
function calculateResponseScore(slaHours: number): number {
  if (slaHours <= 4) return 3.0; // Exceptional
  if (slaHours <= 12) return 2.5; // Excellent
  if (slaHours <= 24) return 2.0; // Good
  if (slaHours <= 48) return 1.5; // Average
  return 1.0; // Below average
}
```

### Real-World Example

```typescript
// Project Requirements
const project = {
  country: 'United Arab Emirates',
  services_needed: ['Web Development', 'Mobile App', 'UI/UX Design'],
  budget: 75000,
};

// Vendor Profile
const vendor = {
  name: 'TechSolutions MENA',
  countries_supported: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'],
  services_offered: [
    'Web Development',
    'Mobile App',
    'UI/UX Design',
    'Digital Marketing',
  ],
  rating: 4.7,
  response_sla_hours: 8,
  typical_budget_range: [50000, 100000],
};

// Calculation Results
const matchResult = {
  totalScore: 8.42,
  breakdown: {
    serviceAlignment: 10.0, // Perfect match (3/3 services)
    geographicMatch: 5.0, // Direct country support
    performanceRating: 4.7, // Excellent rating
    responseCapability: 2.5, // 8-hour SLA (Excellent)
    budgetCompatibility: 2.0, // Budget within range
  },
  confidence: 94,
  ranking: 1,
};
```

## 🚀 Deployment Guide

### Production Deployment

#### 1. Server Requirements

**Minimum Specifications:**

- **CPU**: 4 cores, 2.5GHz+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB SSD minimum
- **OS**: Ubuntu 20.04+ LTS or CentOS 8+
- **Network**: 1Gbps connection recommended

#### 2. Pre-deployment Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

#### 3. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d api.expanders360.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 4. Production Deployment

```bash
# Clone repository
git clone https://github.com/ahmedoothman/expanders360-api.git
cd expanders360-api

# Configure production environment
cp .env.example .env.production
nano .env.production
```

**Production Environment Variables:**

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database - Production
DATABASE_HOST=mysql-prod
DATABASE_PORT=3306
DATABASE_USERNAME=expanders360_user
DATABASE_PASSWORD=super_secure_production_password
DATABASE_NAME=expanders360_prod

# MongoDB - Production
MONGODB_URI=mongodb://expanders360_mongo:secure_mongo_password@mongodb-prod:27017/expanders360_docs_prod?authSource=admin

# JWT - Production (Generate secure keys)
JWT_SECRET=super_long_random_jwt_secret_key_for_production_min_256_bits
JWT_EXPIRES_IN=24h

# Email - Production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@expanders360.com
EMAIL_PASS=production_app_password

# Production Settings
ADMIN_EMAIL=admin@expanders360.com
FRONTEND_URL=https://expanders360.com
ALLOWED_ORIGINS=https://expanders360.com,https://www.expanders360.com

# File Upload - Production
MAX_FILE_SIZE=20971520  # 20MB
UPLOAD_PATH=/var/uploads

# Security
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
CORS_ENABLED=true
HELMET_ENABLED=true

# Monitoring
LOG_LEVEL=warn
ENABLE_LOGGING=true
```

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Run production migrations
docker-compose -f docker-compose.prod.yml exec api npm run migration:run

# Seed initial production data
docker-compose -f docker-compose.prod.yml exec api npm run seed:prod

# Verify deployment
curl https://api.expanders360.com/api/v1/health
```

#### 5. Load Balancer Configuration (Nginx)

```nginx
# /etc/nginx/sites-available/expanders360-api
upstream expanders360_api {
    least_conn;
    server localhost:3000 max_fails=3 fail_timeout=30s;
    server localhost:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name api.expanders360.com;

    ssl_certificate /etc/letsencrypt/live/api.expanders360.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.expanders360.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location /api/v1 {
        proxy_pass http://expanders360_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 25M;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.expanders360.com;
    return 301 https://$server_name$request_uri;
}
```

### Monitoring & Health Checks

#### 1. Application Monitoring

```typescript
// health.controller.ts
@Controller('/api/v1/health')
export class HealthController {
  @Get()
  async getHealth(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      database: await this.checkDatabase(),
      mongodb: await this.checkMongoDB(),
      memory: process.memoryUsage(),
      cpu: os.loadavg(),
    };
  }
}
```

#### 2. Logging Configuration

```typescript
// logger.config.ts
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
};
```
