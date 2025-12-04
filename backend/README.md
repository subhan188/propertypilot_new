# PropertyPilot Backend

A production-ready real estate investment analysis platform built with **Fastify**, **PostgreSQL**, **Prisma**, and **TypeScript**.

**Version**: 1.0.0
**License**: MIT

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (if running without Docker)

### Local Development with Docker

```bash
# Clone the repository
cd /Users/sh7286/Desktop/propertypilot-backend

# Copy environment variables
cp .env.example .env

# Start all services (PostgreSQL, Redis, MinIO, Backend)
docker-compose up --build

# In another terminal, run migrations and seed
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

The backend will be available at `http://localhost:3001`

### Local Development (No Docker)

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Seed database with mock data
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Create a new migration
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with mock data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Fastify app setup
│   ├── types/                # TypeScript type definitions
│   ├── models/               # Zod validation schemas
│   ├── services/             # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Request middleware
│   ├── calculations/         # Financial calculations
│   ├── adapters/             # Data source adapters
│   ├── workers/              # Background jobs
│   ├── utils/                # Utilities & helpers
│   └── db/                   # Database client
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script
│   └── migrations/           # Auto-generated migrations
├── tests/                    # Test files
├── docker-compose.yml        # Local dev environment
├── Dockerfile                # Container image
└── .env.example              # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email & password
- `POST /api/auth/logout` - Logout (destroy session)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/password` - Change password

### Health Check
- `GET /health` - API health status

## Authentication

The API uses **session-based authentication** with httpOnly cookies:

1. Register or login to receive a session cookie
2. Cookie is automatically included in subsequent requests
3. Session is stored in PostgreSQL
4. Logout destroys the session

### Test User

After seeding, you can login with:
- **Email**: `test@propertypilot.com`
- **Password**: `password123`

## Environment Variables

See `.env.example` for all available variables. Key ones:

- `NODE_ENV` - Environment (development, production, test)
- `PORT` - Server port (default 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret (min 32 chars)
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `MINIO_ENDPOINT` - MinIO S3-compatible storage endpoint
- `CORS_ORIGIN` - Frontend URL for CORS

## Database

Using **PostgreSQL** with **Prisma ORM** for type-safe database access.

### Schema

10 tables:
- `User` - User accounts
- `Property` - Real estate properties
- `DealScenario` - Investment analysis scenarios
- `RenovationItem` - Renovation tracking
- `Alert` - User notifications
- `FileUpload` - Photo/document storage metadata
- `UserPreferences` - User settings
- `Integration` - External API integrations
- `AuditLog` - GDPR compliance logging
- `Comp` - Comparable sales data
- `Session` - Session management (managed by connect-pg-simple)

### Migrations

```bash
# Create a new migration after schema changes
npm run db:migrate

# Apply migrations to database
npm run db:push
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- auth.test.ts
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## File Upload

Currently stubbed, ready for integration:
- **Development**: MinIO (S3-compatible local storage)
- **Production**: AWS S3

Signed URLs are generated for secure, temporary file access (7-day expiry).

## Real Estate Data

Using **adapter pattern** for pluggable data sources:
- `MockAdapter` - Mock data (MVP)
- `ZillowAdapter` - Zillow listings (stub)
- `AirDNAAdapter` - Airbnb analytics (stub)
- `MLSAdapter` - MLS data (stub)

Configure via `REAL_ESTATE_DATA_PROVIDER` environment variable.

## Background Jobs

Using **BullMQ + Redis** for job queues:
- Property comps refresh
- Airbnb data sync
- Daily alerts generation
- Report generation

Stubs ready in `src/workers/jobs/`.

## Financial Calculations

Pure functions for investment analysis:
- NOI (Net Operating Income)
- Cap Rate
- Cash on Cash Return
- IRR (Internal Rate of Return)
- NPV (Net Present Value)
- Flip Profit
- Amortization Schedule
- ARV Estimation
- CAGR
- Break-Even Analysis

See `src/calculations/financials.ts` (coming in Phase 3)

## Deployment

### Docker Compose (Local)

```bash
docker-compose up --build
```

All services start automatically with health checks.

### Render / Railway (Production)

See `DEPLOY.md` (coming in Phase 5) for cloud deployment instructions.

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm test`
3. Commit: `git commit -m "Add feature"`
4. Push and create PR

## Phase 1 Status

✅ **Core Setup Complete**
- Fastify + TypeScript
- PostgreSQL + Prisma ORM (10 tables)
- Session-based authentication
- Docker Compose
- Database seeded with 20 properties
- Auth tests

**Next**: Phase 2 - Property CRUD & Dashboard (Days 3-4)

## License

MIT
