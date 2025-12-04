# PropertyPilot - Complete Deployment Guide

**Frontend Status**: ✅ Built and Ready to Deploy
**Build Output**: `dist/` folder (658 KB gzipped)

---

## 📋 Table of Contents

1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Full Stack Deployment Options](#full-stack-deployment-options)
4. [Domain & SSL Setup](#domain--ssl-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Steps](#post-deployment-steps)

---

## 🚀 Frontend Deployment

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Optimized for React/Vite apps
- Free tier available
- Automatic HTTPS and CDN
- Preview deployments for branches
- Edge Functions for redirects
- Zero-config deployments

**Steps**:

1. **Push code to GitHub** (if not already)
   ```bash
   cd /Users/sh7286/Desktop/propertypilot-frontend-main
   git init
   git add .
   git commit -m "Initial commit: PropertyPilot frontend with Zillow integration"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/propertypilot-frontend.git
   git push -u origin main
   ```

2. **Sign up on Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub account
   - Authorize Vercel to access your repos

3. **Create New Project on Vercel**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select `propertypilot-frontend-main` folder as root
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Configure Environment Variables**
   - In Vercel project settings → "Environment Variables"
   - Add: `VITE_API_URL=https://your-backend-url.com`
   - (Example: `https://api.propertypilot.com` or `https://propertypilot-api.render.com`)

5. **Deploy**
   - Vercel auto-deploys on push to `main`
   - Your site is live at: `https://propertypilot.vercel.app` (or custom domain)

**Your frontend is now live!** 🎉

---

### Option 2: Netlify

**Alternative to Vercel with similar features**

**Steps**:

1. **Push to GitHub** (same as Vercel, step 1)

2. **Sign up on Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub

3. **Connect Repository**
   - Click "Add new site" → "Import an existing project"
   - Select GitHub provider
   - Choose your repo

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Owner: Your account

5. **Set Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add: `VITE_API_URL=https://your-backend-url.com`

6. **Deploy**
   - Netlify auto-deploys on push
   - Live at: `https://propertypilot.netlify.app`

---

### Option 3: AWS S3 + CloudFront (Most Control)

**For maximum control and enterprise features**

**Steps**:

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://propertypilot-frontend-prod
   ```

2. **Configure S3 for Static Hosting**
   ```bash
   aws s3 website s3://propertypilot-frontend-prod \
     --index-document index.html \
     --error-document index.html
   ```

3. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://propertypilot-frontend-prod \
     --delete \
     --cache-control "max-age=31536000" \
     --exclude "index.html"

   aws s3 cp dist/index.html s3://propertypilot-frontend-prod/index.html \
     --cache-control "no-cache" \
     --content-type "text/html"
   ```

4. **Create CloudFront Distribution**
   - AWS Console → CloudFront → Create Distribution
   - Origin: S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: `index.html`
   - Error Pages: 404 → index.html (for SPA routing)

5. **Configure Custom Domain** (see Domain Setup section below)

---

## 🔧 Backend Deployment

### Option 1: Render (Recommended - Free Tier)

**Why Render?**
- Free tier with PostgreSQL
- Native Node.js support
- Automatic HTTPS
- GitHub auto-deploy
- Integrated database hosting

**Steps**:

1. **Push backend to GitHub**
   ```bash
   cd /Users/sh7286/Desktop/propertypilot-backend
   git init
   git add .
   git commit -m "Initial commit: PropertyPilot backend with Zillow integration"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/propertypilot-backend.git
   git push -u origin main
   ```

2. **Create PostgreSQL Database on Render**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New +" → "PostgreSQL"
   - Name: `propertypilot-db-prod`
   - Region: Choose closest to you
   - Create database
   - Copy connection string (looks like: `postgresql://user:password@host:5432/db`)

3. **Deploy Backend Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Instance: Free tier (0.5 CPU, 512 MB RAM)

4. **Configure Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:password@host:5432/db
   SESSION_SECRET=generate-long-random-string-min-32-chars
   REDIS_HOST=redis-instance-url (optional, or use external Redis)
   HASDATA_API_KEY=your_hasdata_key
   CORS_ORIGIN=https://your-frontend-url.com
   FRONTEND_URL=https://your-frontend-url.com
   ```

5. **Run Database Migrations**
   - After deployment, run in Render shell:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Your backend is live!**
   - API URL: `https://propertypilot-api.render.com`

---

### Option 2: Railway (Alternative)

**Similar to Render with slightly better free tier**

**Steps**:

1. **Sign up on Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Import your backend GitHub repo

3. **Add PostgreSQL Plugin**
   - In Railway project → Add service
   - Select PostgreSQL
   - Auto-configures DATABASE_URL

4. **Configure Build & Start Commands**
   - Build: `npm ci && npm run build`
   - Start: `npm start`

5. **Set Environment Variables** (same as Render above)

6. **Deploy**
   - Railway auto-deploys on push
   - API URL shown in deployment logs

---

### Option 3: Heroku (Deprecated - Not Recommended)

⚠️ Heroku's free tier ended. Use Render or Railway instead.

---

## 📊 Full Stack Deployment Options

### Recommended Stack (Best Balance)

| Component | Service | Free Tier | Cost/mo |
|-----------|---------|-----------|---------|
| Frontend | Vercel | ✅ Yes | $0-20 |
| Backend API | Render | ✅ Yes | $7-50 |
| Database | Render PostgreSQL | ✅ Yes (limited) | $7+ |
| Redis Cache | Render | ✅ Yes | Free |
| File Storage | AWS S3 | ✅ Yes (limited) | $1-5 |
| Domain | Namecheap | ✅ Yes | $0.99-15 |
| **TOTAL** | | | **$8-90/mo** |

### Enterprise Stack (Highest Performance)

| Component | Service | Cost/mo |
|-----------|---------|---------|
| Frontend | AWS CloudFront | $20-100 |
| Backend | AWS App Runner | $50-200 |
| Database | AWS RDS PostgreSQL | $30-200+ |
| Redis | AWS ElastiCache | $20-100+ |
| File Storage | AWS S3 | $5-50 |
| Monitoring | Datadog | $50+ |
| **TOTAL** | | **$175-650+/mo** |

---

## 🌐 Domain & SSL Setup

### Step 1: Purchase Domain

**Option A: Namecheap** (Cheapest)
1. Go to https://namecheap.com
2. Search domain (e.g., `propertypilot.com`)
3. Add to cart → Checkout
4. Create account → Buy
5. Note the nameservers

**Option B: Google Domains** (Most Reliable)
1. Go to https://domains.google
2. Search and buy domain
3. Auto-configures DNS

**Option C: Cloudflare Domains** (Best for DNS)
1. Go to https://cloudflare.com
2. Buy domain (transfers existing or buys new)
3. Automatic DNS management

---

### Step 2: Point Domain to Frontend (Vercel)

**If using Vercel** (recommended):

1. In Vercel project settings:
   - Settings → Domains
   - Add custom domain: `propertypilot.com`
   - Add subdomain: `www.propertypilot.com`

2. Vercel shows CNAME/A records to add

3. In your domain registrar (Namecheap/Google/etc):
   - Go to DNS settings
   - Add the records Vercel shows
   - Wait 5-15 minutes for propagation

4. Vercel automatically provisions SSL certificate
   - Your site is now accessible at `https://propertypilot.com`

**If using AWS S3 + CloudFront**:

1. Create SSL certificate in AWS Certificate Manager
   - Region: us-east-1 (for CloudFront)
   - Domain: `propertypilot.com` and `*.propertypilot.com`
   - Verify ownership (DNS challenge)

2. In CloudFront distribution:
   - Add Custom SSL certificate
   - Add alternate domain names: `propertypilot.com`, `www.propertypilot.com`

3. In domain registrar:
   - Add CNAME: `propertypilot.com` → CloudFront distribution

---

### Step 3: Point Backend Subdomain (Render/Railway)

**If using Render**:

1. In Render dashboard:
   - Service → Settings → Custom domain
   - Add: `api.propertypilot.com`

2. Copy CNAME value from Render

3. In domain registrar:
   - Add DNS record:
     - Type: CNAME
     - Name: `api`
     - Value: [Render's CNAME]

4. Render auto-provisions SSL (within 5 min)

**Frontend URL**: `https://propertypilot.com`
**Backend URL**: `https://api.propertypilot.com`

---

## 🔐 Environment Variables

### Frontend (.env.production)

```bash
VITE_API_URL=https://api.propertypilot.com
VITE_APP_NAME=PropertyPilot
```

**Note**: Create `.env.production` locally (not in git):
```bash
cp .env.example .env.production
# Edit with production values
```

Then in Vercel/Netlify dashboard, set these same variables.

---

### Backend (.env.production)

**Create file locally** (NEVER commit to git):

```bash
# App
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@render-db.com:5432/db

# Session
SESSION_SECRET=generate-32-character-random-string-here
COOKIE_DOMAIN=propertypilot.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Redis (optional, can use in-memory for MVP)
REDIS_HOST=redis.render.com
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# File Storage (S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=propertypilot-files-prod

# Zillow/HasData
HASDATA_API_KEY=your_hasdata_key

# CORS & Frontend
CORS_ORIGIN=https://propertypilot.com
FRONTEND_URL=https://propertypilot.com

# Email (SendGrid - optional)
SENDGRID_API_KEY=your_sendgrid_key

# Error Tracking (Sentry - optional)
SENTRY_DSN=your_sentry_dsn
```

**Steps to set in Render**:

1. Render dashboard → Service → Environment
2. Paste all variables from above
3. Save and redeploy

---

## ✅ Post-Deployment Steps

### 1. Verify Frontend is Live
```bash
curl https://propertypilot.com
# Should return HTML content
```

### 2. Verify Backend API is Live
```bash
curl https://api.propertypilot.com/health
# Or test login:
curl -X POST https://api.propertypilot.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 3. Test Frontend → Backend Connection
- Open https://propertypilot.com in browser
- Open DevTools (F12) → Network tab
- Try to login or navigate
- Watch for API calls to `api.propertypilot.com`
- Should see 2xx or 4xx responses (not CORS errors)

### 4. Set Up Database

**Via Render CLI**:
```bash
# Download Render CLI
# Run migrations
npx prisma migrate deploy

# Seed with mock data
npx prisma db seed
```

**Or via SSH** (if available):
```bash
ssh into-render-instance
cd /opt/render/project
npx prisma migrate deploy
```

### 5. Test Core Features

**Register Account**:
- Go to Settings page
- Sign up with test email
- Should receive confirmation

**Search Properties**:
- Properties page → Search Zillow tab
- Search "Boston, MA"
- Should see Zillow listings (requires HASDATA_API_KEY)

**Import Property**:
- Click "Add to Portfolio"
- Should create property in database
- Check Properties list

**Dashboard**:
- Should show portfolio overview
- Should display Market Insights (if properties have Zillow data)

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-Deploy on Push)

**Frontend (.github/workflows/deploy-frontend.yml)**:

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'package.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci && npm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Backend** (Auto-deploy with GitHub integration in Render/Railway):
- Render/Railway auto-deploys on push to main
- No additional setup needed

---

## 📊 Monitoring & Maintenance

### Uptime Monitoring

**Free Option - UptimeRobot**:
1. Go to https://uptimerobot.com
2. Create account
3. Add monitors:
   - `https://propertypilot.com` (frontend)
   - `https://api.propertypilot.com/health` (backend)
4. Get alerts if sites go down

### Log Monitoring

**Render**: Built-in logs in dashboard
**Frontend**: Use Sentry for error tracking

### Performance Monitoring

**Frontend**:
- Vercel Analytics (built-in)
- Google PageSpeed Insights

**Backend**:
- Render metrics
- Add Sentry for error tracking

---

## 🚨 Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
- Backend: Ensure `CORS_ORIGIN=https://propertypilot.com`
- Frontend: Set `VITE_API_URL=https://api.propertypilot.com`
- Restart both services

### Database Connection Error
```
connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check database is running (Render PostgreSQL service)
- Test connection: `psql $DATABASE_URL`

### Zillow Search Returns Empty
```
"No properties found"
```

**Solution**:
- Verify `HASDATA_API_KEY` is set in backend
- Check quota at https://hasdata.com/dashboard
- Try searching different location

### API Key Issues
```
401 Unauthorized - Invalid API key
```

**Solution**:
- Get key from https://docs.hasdata.com
- Add to `.env`: `HASDATA_API_KEY=sk_live_xxx`
- Redeploy backend

---

## 💾 Backup Strategy

### Database Backups

**Render** (automatic):
- Automatic backups daily
- Available in Render dashboard
- 7-day retention on free tier

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Code Backups

- GitHub is your backup
- All code in git repository
- Easy recovery: `git clone`

---

## 🎯 Final Checklist

- ✅ Frontend built and pushed to GitHub
- ✅ Backend pushed to GitHub
- ✅ Vercel/Netlify account created
- ✅ Render account with PostgreSQL database
- ✅ Domain purchased
- ✅ DNS records configured
- ✅ Environment variables set
- ✅ Database migrations run
- ✅ Frontend accessible at domain
- ✅ Backend API responding
- ✅ CORS configured correctly
- ✅ HASDATA_API_KEY working
- ✅ Test account created
- ✅ Core features tested
- ✅ Monitoring set up

---

## 🚀 You're Live!

Your PropertyPilot application is now deployed online:

- **Frontend**: https://propertypilot.com
- **Backend API**: https://api.propertypilot.com
- **Dashboard**: https://propertypilot.com/ (after login)

Share with users and start tracking real estate properties with Zillow integration!

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vite Docs**: https://vitejs.dev

---

## 🔐 Security Reminders

1. **Never commit `.env`** files
2. **Rotate API keys** regularly
3. **Use HTTPS** everywhere (auto with Vercel/Render)
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**: `npm audit fix`
6. **Use environment-specific secrets** (dev, staging, prod)

---

Good luck! Your PropertyPilot is now live on the internet! 🎉
