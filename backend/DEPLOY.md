# PropertyPilot Backend Deployment Guide

**Version**: 1.0.0
**Last Updated**: December 2024

## Table of Contents

1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Migrations](#database-migrations)
5. [Background Jobs](#background-jobs)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **Docker** & **Docker Compose**
- **npm** 9+

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd propertypilot-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Start services with Docker Compose**
```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **MinIO** (ports 9000 API, 9001 Console)
- **Backend** (port 3001)

5. **Run database migrations**
```bash
npx prisma migrate dev
```

6. **Seed database with mock data**
```bash
npx prisma db seed
```

7. **Access the API**
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health
- MinIO Console: http://localhost:9001 (login: minioadmin/minioadmin)

### Development Commands

```bash
# Start in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Run Prisma Studio (database UI)
npx prisma studio
```

### Docker Compose Services

The `docker-compose.yml` includes health checks for all services. Monitor the status:

```bash
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## Production Deployment

PropertyPilot supports two recommended deployment platforms: **Render** and **Railway**. Both support PostgreSQL, Redis, and custom environment variables out of the box.

### Deployment Options

#### Option 1: Render (Recommended for US Deployment)

1. **Create a Render account** at https://render.com

2. **Create a PostgreSQL database**
   - Dashboard → New → PostgreSQL
   - Database name: `propertypilot-db`
   - Copy the internal and external connection strings

3. **Create a Redis instance**
   - Dashboard → New → Redis
   - Copy the internal connection URL

4. **Create a Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
   - Select Node.js environment

5. **Configure environment variables**
   - See [Environment Configuration](#environment-configuration) below
   - Add each variable in the Render dashboard under Environment

6. **Set up S3/Storage**
   - Render doesn't provide S3 natively
   - Use AWS S3 (create bucket and credentials)
   - Or use AWS RDS for better integration

7. **Deploy**
   - Commit to your GitHub repository
   - Render automatically deploys on push to main

#### Option 2: Railway

1. **Create a Railway account** at https://railway.app

2. **Create project**
   - Dashboard → New Project
   - Add services: PostgreSQL, Redis (via plugins)

3. **Add service**
   - Connect GitHub repository
   - Railway auto-detects Node.js
   - Configure build and start commands

4. **Configure environment variables**
   - Railway auto-provides `DATABASE_URL` and `REDIS_URL`
   - Add additional variables in project settings

5. **Deploy**
   - Connect repository and enable auto-deploy

#### Option 3: AWS (For Enterprise)

**Services Required**:
- **ECS** or **Elastic Beanstalk**: Backend container
- **RDS PostgreSQL**: Database
- **ElastiCache Redis**: Job queue
- **S3**: File storage
- **CloudFront**: CDN for signed URLs
- **Route 53**: DNS
- **ACM**: SSL certificates

**Dockerfile** (included in repo):
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**Deploy with ECS**:
```bash
# Build and push Docker image
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <your-ecr-uri>

docker build -t propertypilot-backend:latest .
docker tag propertypilot-backend:latest <ecr-uri>/propertypilot-backend:latest
docker push <ecr-uri>/propertypilot-backend:latest

# Update ECS task definition with new image URI
# Deploy via CloudFormation or Terraform
```

---

## Environment Configuration

### .env Variables

Create `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@host:5432/propertypilot

# Session
SESSION_SECRET=<32+ random characters>

# Redis
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<optional>

# File Storage (choose one)
# Option A: MinIO (local/self-hosted)
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=propertypilot

# Option B: AWS S3 (production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=propertypilot-files

# CORS
CORS_ORIGIN=https://app.propertypilot.com,https://www.propertypilot.com
FRONTEND_URL=https://app.propertypilot.com

# Real Estate Data Provider
REAL_ESTATE_DATA_PROVIDER=mock
# Uncomment for real integrations (API keys required)
# ZILLOW_API_KEY=<your-key>
# AIRDNA_API_KEY=<your-key>
# MLS_API_KEY=<your-key>

# Optional: Monitoring & Error Tracking
SENTRY_DSN=<optional-sentry-dsn>
LOG_LEVEL=info

# Optional: Email
SENDGRID_API_KEY=<optional>
SENDGRID_FROM_EMAIL=noreply@propertypilot.com
```

### Environment-Specific Configurations

#### Development (`.env.local`)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/propertypilot_dev
MINIO_ENDPOINT=http://localhost:9000
REDIS_HOST=localhost
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

#### Staging (`.env.staging`)
```bash
NODE_ENV=staging
CORS_ORIGIN=https://staging.propertypilot.com
REAL_ESTATE_DATA_PROVIDER=mock
```

#### Production (`.env.production`)
```bash
NODE_ENV=production
CORS_ORIGIN=https://app.propertypilot.com
REAL_ESTATE_DATA_PROVIDER=mock
LOG_LEVEL=warn
```

---

## Database Migrations

### Creating Migrations

```bash
# After modifying prisma/schema.prisma
npx prisma migrate dev --name descriptive_name

# Review the SQL
# Commit the migration file to version control
```

### Running Migrations in Production

```bash
# On your deployment platform, run before releasing new code
npx prisma migrate deploy

# This is idempotent and safe to run multiple times
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump postgresql://user:password@host:5432/propertypilot > backup.sql

# Restore
psql postgresql://user:password@host:5432/propertypilot < backup.sql
```

### Rolling Back Migrations

```bash
# Only supported in development
npx prisma migrate resolve --rolled-back migration_name

# For production, create a new migration that reverts changes
npx prisma migrate dev --name revert_previous_change
```

---

## Background Jobs

PropertyPilot uses **BullMQ** for background job processing. Jobs run asynchronously in Redis-backed workers.

### Available Jobs

| Job | Frequency | Purpose |
|---|---|---|
| `REFRESH_PROPERTY_COMPS` | Daily (9 AM) | Fetch comparable sales data |
| `SYNC_AIRDNA_DATA` | Daily (10 AM) | Update Airbnb rental estimates |
| `GENERATE_DAILY_ALERTS` | Daily (8 AM) | Create price & market alerts |
| `GENERATE_REPORT` | On-demand | Generate portfolio reports |

### Monitoring Jobs

```bash
# View job queue status (requires Redis CLI)
redis-cli

# Inside Redis CLI
> KEYS bull:*
> LRANGE bull:queue:jobname:active 0 -1
```

### Job Retry Logic

Jobs have automatic retry with exponential backoff:
- **Max retries**: 3
- **Backoff**: Exponential (1s, 2s, 4s)
- **Failed jobs**: Retained for 24 hours in `failed` bucket

### Custom Job Scheduling

To add a scheduled job:

```typescript
// src/workers/jobs/myJob.ts
import { Queue } from 'bullmq';
import { redisConnection } from '@/utils/config';

export const myQueue = new Queue('myJob', { connection: redisConnection });

export async function scheduleMyJob() {
  await myQueue.add(
    'myJobName',
    { data: 'payload' },
    { repeat: { cron: '0 9 * * *' } } // 9 AM daily
  );
}
```

---

## Monitoring & Logging

### Application Logs

Logs are written to stdout and can be captured by your deployment platform:

```bash
# In development
npm run dev

# In production, logs are captured by:
# - Render: Dashboard → Logs
# - Railway: Logs tab
# - Docker: docker-compose logs -f
```

### Log Levels

```bash
NODE_ENV=production LOG_LEVEL=debug npm start  # Most verbose
NODE_ENV=production LOG_LEVEL=info npm start   # Normal
NODE_ENV=production LOG_LEVEL=warn npm start   # Warnings only
NODE_ENV=production LOG_LEVEL=error npm start  # Errors only
```

### Health Checks

The API includes a health check endpoint for monitoring:

```bash
curl http://localhost:3001/health
# Response: { "status": "ok", "timestamp": "2024-12-03T10:00:00.000Z" }
```

Use this in your deployment platform's health check configuration:
- **Render**: Path: `/health`, Interval: 30s
- **Railway**: `HTTP /health`

### Error Tracking (Optional)

Integrate with **Sentry** for error tracking:

1. Create Sentry project at https://sentry.io
2. Set `SENTRY_DSN` environment variable
3. Errors are automatically reported to Sentry

### Metrics & Observability

For production deployments, consider adding:
- **Prometheus** for metrics collection
- **DataDog** or **New Relic** for APM
- **CloudWatch** for AWS deployments

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: P1000 Can't reach database server
```

**Solution**:
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running: `docker-compose ps`
- Verify network connectivity and firewall rules

#### 2. Redis Connection Error

```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
- Verify `REDIS_HOST` and `REDIS_PORT` are correct
- Check Redis service is running: `docker-compose ps`
- Confirm Redis is accessible from the backend container

#### 3. S3/MinIO Upload Fails

```
Error: Access Denied
```

**Solution**:
- Verify `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` are correct
- Check MinIO bucket exists: `docker-compose exec minio mc ls minio/propertypilot`
- Create bucket if needed: `docker-compose exec minio mc mb minio/propertypilot`

#### 4. CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
- Verify `CORS_ORIGIN` includes the frontend URL
- If in development, ensure `CORS_ORIGIN=http://localhost:3000`
- Restart backend after changing CORS settings

#### 5. Session Expiration Issues

```
401 Unauthorized
```

**Solution**:
- Verify `SESSION_SECRET` is set and consistent across restarts
- Check session cookie is being sent (browser dev tools → Network → Cookies)
- Session expires after 24 hours; user must log back in

### Debugging

#### Enable Debug Logging

```bash
NODE_ENV=development LOG_LEVEL=debug npm run dev
```

#### Database Inspection

```bash
# Open Prisma Studio (web UI for database)
npx prisma studio

# Or use PostgreSQL CLI
psql postgresql://user:password@host:5432/propertypilot
\dt  # List tables
SELECT * FROM "User";
```

#### Redis Inspection

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View all keys
> KEYS *

# Check specific key
> GET mykey

# Clear all data (development only!)
> FLUSHALL
```

### Performance Optimization

1. **Database Indexes**: Review `prisma/schema.prisma` for missing indexes
2. **Slow Queries**: Enable query logging and review slow query log
3. **Cache Strategy**: Add caching for frequently accessed data
4. **Rate Limiting**: Current limits may need adjustment based on usage patterns
5. **Background Jobs**: Monitor job processing time and adjust frequency

### Disaster Recovery

#### Database Backup Strategy

```bash
# Automated daily backups (setup on your platform)
# Render: Automatic daily backups to S3
# Railway: Managed backups included

# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

#### File Storage Backup

```bash
# S3 backup via AWS CLI
aws s3 sync s3://propertypilot-files s3://propertypilot-files-backup

# MinIO backup
docker-compose exec minio mc mirror minio/propertypilot minio-backup/propertypilot
```

---

## Performance Benchmarks

Expected performance on production infrastructure:

| Metric | Benchmark |
|---|---|
| API Response Time (p50) | < 100ms |
| API Response Time (p99) | < 500ms |
| Database Query Time | < 50ms (with indexes) |
| File Upload Time | < 2s for 10MB file |
| Concurrent Users | 1000+ |
| Requests Per Second | 500+ |

---

## Support & Escalation

For deployment issues:

1. Check logs: `docker-compose logs -f` or platform dashboard
2. Verify environment variables are set correctly
3. Confirm database migrations have run: `npx prisma migrate status`
4. Check health endpoint: `curl http://localhost:3001/health`
5. Verify downstream services (database, Redis) are healthy

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords (`SESSION_SECRET`, `MINIO_ACCESS_KEY`, etc.)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN` (only your frontend domain)
- [ ] Enable database encryption at rest
- [ ] Set up database backups
- [ ] Configure rate limiting thresholds
- [ ] Enable audit logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure monitoring and alerting
- [ ] Review security headers (set by Fastify)
- [ ] Test login/session handling
- [ ] Test file uploads and S3 access
- [ ] Load test the API

---

## Scaling Considerations

As usage grows:

1. **Database**: Scale PostgreSQL with read replicas
2. **Redis**: Scale Redis cluster or use managed Redis
3. **Backend**: Horizontal scaling with load balancer
4. **File Storage**: S3 scales automatically; MinIO requires clustering
5. **Background Jobs**: Add more worker instances
6. **CDN**: Add CloudFront or Cloudflare for static assets and signed URLs

---

## Rollback Procedures

To rollback to a previous version:

**Git-based rollback** (Render/Railway):
```bash
git revert <commit-hash>
git push origin main
# Platform auto-deploys the rollback
```

**Manual rollback**:
1. Deploy previous Docker image tag
2. Run any necessary database rollbacks: `npx prisma migrate resolve`
3. Verify health check passes
4. Monitor error rates

---

## Additional Resources

- [Render Deployment Docs](https://render.com/docs)
- [Railway Deployment Docs](https://docs.railway.app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Fastify Documentation](https://www.fastify.io)
