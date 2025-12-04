# PropertyPilot - Real Estate Investment Analysis Platform

A full-stack real estate investment analysis platform with Zillow integration, financial modeling, and portfolio management.

## Project Structure

```
propertypilot/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks (useZillowSearch, etc.)
│   │   ├── mocks/          # Mock data for development
│   │   └── lib/            # Utility functions
│   ├── vercel.json         # Vercel deployment configuration
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite build configuration
│
├── backend/           # Fastify + TypeScript backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Request/response middleware
│   │   ├── utils/          # Utilities (HasData client, S3, etc.)
│   │   ├── calculations/   # Financial calculations
│   │   ├── adapters/       # Real estate data adapters
│   │   └── workers/        # Background jobs
│   ├── prisma/             # Database schema
│   ├── docker-compose.yml  # Local development environment
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── .gitignore              # Git ignore patterns
└── README.md               # This file

```

## Features

### Frontend
- ✅ Property portfolio management
- ✅ Zillow property search integration
- ✅ Deal analysis and financial scenarios
- ✅ Property detail views with photos
- ✅ Dashboard with KPIs and market insights
- ✅ Renovation tracking
- ✅ Alert system
- ✅ Map visualization
- ✅ Dark mode support

### Backend
- ✅ RESTful API (30+ endpoints)
- ✅ Zillow/HasData API integration
- ✅ Financial calculations (NOI, Cap Rate, IRR, NPV, etc.)
- ✅ Database with 10 tables
- ✅ Session-based authentication
- ✅ File upload support (S3/MinIO)
- ✅ Background job processing (BullMQ)
- ✅ Real estate data adapters
- ✅ Rate limiting and audit logging
- ✅ GDPR/CCPA compliance

## Quick Start

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the frontend folder
3. Configure environment variables if needed
4. Deploy!

**Environment Variables:**
```
VITE_API_BASE_URL=https://your-api.com  # Optional, defaults to http://localhost:3001
```

### Backend Deployment

#### Local Development
```bash
cd backend
cp .env.example .env
docker-compose up --build
npm run db:migrate
npm run db:seed
```

#### Production (Render/Railway/AWS)
See `backend/DEPLOY.md` for detailed deployment instructions.

**Required Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key-min-32-chars
HASDATA_API_KEY=your-hasdata-api-key  # Optional for Zillow integration
```

## API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: Your deployed backend URL

### Authentication
Session-based with httpOnly cookies. Login endpoint:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Key Endpoints
- **Properties**: `GET/POST /api/properties`
- **Property Details**: `GET /api/properties/:id`
- **Scenarios**: `POST /api/properties/:id/scenarios`
- **Zillow Search**: `POST /api/zillow/search`
- **Zillow Import**: `POST /api/zillow/import`
- **Dashboard**: `GET /api/dashboard/kpi`

Full API reference: See `backend/INTEGRATION.md`

## Zillow Integration

### Prerequisites
- Sign up for HasData API: https://docs.hasdata.com
- Get your API key
- Add to backend `.env`: `HASDATA_API_KEY=your_key`

### Features
- Search Zillow listings with filters
- Import properties directly to portfolio
- Track Zillow data: price, zestimate, rental estimate
- Auto-refresh property data
- API quota tracking

See `backend/ZILLOW_INTEGRATION.md` for detailed guide.

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- React Router
- React Hook Form
- Framer Motion

### Backend
- Fastify 5
- Node.js
- PostgreSQL
- Prisma ORM
- TypeScript
- BullMQ + Redis
- Axios
- Jest + Supertest

### Deployment
- Vercel (Frontend)
- Render/Railway/AWS (Backend)
- Docker (Local Development)
- GitHub Actions (CI/CD)

## Documentation

- **API Reference**: `backend/INTEGRATION.md`
- **Deployment Guide**: `backend/DEPLOY.md`
- **Zillow Integration**: `backend/ZILLOW_INTEGRATION.md`
- **Implementation Details**: `backend/ZILLOW_IMPLEMENTATION_COMPLETE.md`
- **Project Status**: `backend/PROJECT_STATUS.md`

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev              # Start dev server at localhost:8080
npm run build           # Build for production
npm run lint            # Run ESLint
```

### Backend
```bash
cd backend
npm install
npm run dev             # Start dev server at localhost:3001
npm run build           # Build for production
npm run test            # Run tests
npm run test:coverage   # Coverage report
npx prisma studio      # Database UI
```

## CI/CD

GitHub Actions pipeline includes:
- ESLint
- TypeScript type checking
- Jest tests
- Docker build
- Deployment (staging & production with approval)

## License

MIT

## Support

For issues or questions:
1. Check the documentation in each folder
2. Review GitHub issues
3. Contact the development team
