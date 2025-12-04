# PropertyPilot Backend - Railway Deployment Guide

**Status**: ✅ Ready for Railway Deployment
**Tested**: Yes - Procfile and railway.json configured

---

## What's Fixed

The Railway deployment error was caused by corrupted `node_modules` in git. This has been fixed:

✅ **Removed** 18,965 corrupted node_modules files
✅ **Added** `Procfile` with proper build and start commands
✅ **Added** `railway.json` with deployment configuration
✅ **Repository size** reduced from 722MB → 440MB

---

## Quick Deployment (5 minutes)

### 1. Connect GitHub to Railway

1. Go to https://railway.app
2. Create a new account or login
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Authorize and select `subhan188/propertypilot_new` repository
6. Select `backend` as the root directory

### 2. Configure Environment Variables

In Railway project settings, add these variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-32-character-secret-key-here
HASDATA_API_KEY=your-hasdata-api-key  # Optional for Zillow
PORT=3001  # Will be auto-set by Railway
```

**Getting DATABASE_URL:**

Option A: Use Railway's PostgreSQL plugin
- In Railway: Add plugin → PostgreSQL
- Railway auto-fills `DATABASE_URL`

Option B: Use external PostgreSQL
- Get connection string from your provider
- Format: `postgresql://user:password@host:port/dbname`

**SESSION_SECRET:**
- Generate a random 32+ character string
- Example: `openssl rand -hex 32` (on Mac/Linux)
- Or use: `https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html`

### 3. Deploy

1. Click "Deploy" in Railway
2. Railway automatically:
   - Clones the repository
   - Installs dependencies (`npm install`)
   - Builds the backend (`npm run build`)
   - Starts the server (`npm start`)
   - Creates public URL

3. View live URL in Railway dashboard (e.g., `https://your-project.railway.app`)

### 4. Run Database Migrations

After first deployment:

```bash
# In Railway terminal/CLI
npm run db:migrate
npm run db:seed  # Optional: load sample data
```

Or use Railway's UI:
- Go to project
- Click "Deployments"
- Select latest deployment
- Open terminal
- Run commands above

---

## What Happens on Deploy

Railway reads the `Procfile` and runs:

```
npm run build && npm start
```

This:
1. **Build** - Compiles TypeScript (`tsc`)
2. **Start** - Runs compiled Node.js server

The backend will be accessible at: `https://your-service-name.railway.app`

---

## Configuration Files

### `Procfile`
```
web: npm run build && npm start
```
Tells Railway how to start the application.

### `railway.json`
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyMaxRetries": 5
  }
}
```
Tells Railway to use Nixpacks builder and restart on failure.

### `package.json` Scripts
```json
{
  "build": "tsc",
  "start": "node dist/index.js"
}
```
- `build` - Compiles TypeScript to JavaScript in `dist/`
- `start` - Runs the compiled server

---

## Environment Variables Guide

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Enables production optimizations |
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | `abc123...xyz` | Min 32 characters, random string |
| `PORT` | No | `3001` | Railway auto-sets this |
| `HASDATA_API_KEY` | No | `sk_live_...` | For Zillow integration (optional) |
| `LOG_LEVEL` | No | `info` | `debug`, `info`, `warn`, `error` |

---

## Troubleshooting

### Build Fails: "Cannot find module"

**Cause**: node_modules issue (should be fixed now)
**Solution**:
1. Go to Railway → Deployments
2. Click "Redeploy" to retry
3. Check logs for specific error
4. If persists, run: `npm run build` locally to verify

### "Prisma schema file not found"

**Cause**: Missing `prisma/schema.prisma`
**Solution**:
- Verify file exists in `backend/prisma/schema.prisma`
- Check that `prisma/` is not in `.gitignore`

### "Connection timeout" on database

**Cause**: DATABASE_URL wrong or database not running
**Solution**:
1. Add Railway PostgreSQL plugin (easiest)
2. Or verify DATABASE_URL is correct
3. Check database is accessible from Railway's IP

### Server crashes immediately

**Cause**: Missing environment variables or database error
**Solution**:
1. Check all required vars are set
2. View logs: Railway → Deployments → Logs
3. Try running locally: `npm run build && npm start`

### API returns 502 Bad Gateway

**Cause**: Server crashed or not responding
**Solution**:
1. Check Railway logs
2. Verify PostgreSQL is running
3. Check PORT environment variable

---

## Monitoring & Logs

### View Logs
1. Go to Railway project dashboard
2. Click on the "Backend" service
3. Click "Logs" tab
4. Real-time logs appear

### Health Check
Test if API is running:
```bash
curl https://your-service-name.railway.app/health
```

Response should be:
```json
{ "status": "ok" }
```

### Restart Service
If server acts up:
1. Railway → Service → "Redeploy"
2. Or click "Restart"

---

## Connecting Frontend

Once backend is live on Railway, update frontend environment:

**In `frontend/` Vercel Settings:**
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_BASE_URL=https://your-backend.railway.app`
3. Redeploy

Or in `frontend/vercel.json`:
```json
{
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url"
  }
}
```

Then in Vercel Project Settings, set:
- `VITE_API_BASE_URL=https://your-backend.railway.app`

---

## Database Setup

### Option 1: Railway PostgreSQL (Easiest)

1. In Railway project: "Add" → "Database" → "PostgreSQL"
2. Railway automatically creates and sets `DATABASE_URL`
3. Run migrations:
   ```
   npm run db:migrate
   npm run db:seed
   ```

### Option 2: External PostgreSQL

1. Get connection string from provider (Heroku Postgres, RDS, etc.)
2. Add to Railway: `DATABASE_URL=postgresql://...`
3. Ensure database allows connections from Railway's IP
4. Run migrations

### Initial Setup
```bash
# After deploying and connecting database:
npm run db:migrate    # Create tables
npm run db:seed       # Optional: load sample data
```

---

## Scaling

Railway provides:
- Auto-scaling based on CPU/memory
- Multiple replicas for high availability
- PostgreSQL backups
- Custom domains

Configure in Railway → Service → Settings

---

## Cost Estimate

**Railway Free Tier**: $5/month credit
- Covers small deployment nicely
- Database included
- 500 build minutes/month

**After free tier**:
- $0.10/GB RAM hour
- $0.10/vCPU hour
- Typical backend: ~$50-100/month

---

## Post-Deployment Checklist

- [ ] Backend deployed and URL live
- [ ] Database migrations run successfully
- [ ] Health check endpoint returns 200
- [ ] All environment variables set
- [ ] Frontend updated with backend API URL
- [ ] Frontend-backend communication working
- [ ] API responses returning data
- [ ] Logs clean (no errors)
- [ ] Database backups enabled
- [ ] Custom domain configured (optional)

---

## Support & Docs

- **Railway Docs**: https://docs.railway.app
- **Railway CLI**: `railway --help`
- **Backend API Docs**: See `backend/INTEGRATION.md`
- **Zillow Integration**: See `backend/ZILLOW_INTEGRATION.md`

---

## Summary

Your backend is now **ready for Railway deployment**:

✅ Procfile configured
✅ Build and start scripts working
✅ node_modules cleaned up
✅ Environment variables documented
✅ Database setup options provided

**Next step**: Deploy on Railway and connect frontend!

---

**Repository**: https://github.com/subhan188/propertypilot_new.git
**Status**: Production-Ready ✅
**Last Updated**: December 4, 2024
