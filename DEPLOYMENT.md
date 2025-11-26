# SPT Index Dashboard - Deployment Guide

## Current Status

✅ **Frontend Deployed:** https://frontend-qqlpnk096-lifeanalysis-projects.vercel.app  
⏳ **Backend:** Needs to be deployed  
📦 **GitHub Repository:** https://github.com/LifeAnalysis/spt-index

## Architecture

- **Frontend:** Next.js app deployed on Vercel
- **Backend:** Express API server (needs separate deployment)
- **Data Flow:** Frontend → Next.js API Route → Backend Express API → DeFiLlama

## Backend Deployment Options

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select the `spt-index` repository
5. Set root directory to `backend`
6. Railway will auto-detect the Node.js app and deploy
7. Once deployed, copy the public URL (e.g., `https://spt-backend.up.railway.app`)

### Option 2: Render

1. Go to [render.com](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** spt-backend
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"
6. Copy the service URL once deployed

### Option 3: Heroku

```bash
# From the project root
cd backend
heroku create spt-backend
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a spt-backend
git push heroku main
```

## Connecting Frontend to Backend

Once your backend is deployed, you need to set the `BACKEND_URL` environment variable in Vercel:

### Via Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/lifeanalysis-projects/frontend
2. Go to Settings → Environment Variables
3. Add:
   - **Name:** `BACKEND_URL`
   - **Value:** Your backend URL (e.g., `https://spt-backend.up.railway.app`)
   - **Environments:** Production, Preview, Development
4. Click "Save"
5. Go to Deployments and click "Redeploy" on the latest deployment

### Via CLI

```bash
cd frontend
# Set for production
echo "YOUR_BACKEND_URL" | vercel env add BACKEND_URL production

# Redeploy
vercel --prod
```

## Verifying the Deployment

1. Visit your frontend URL: https://frontend-qqlpnk096-lifeanalysis-projects.vercel.app
2. Check browser console for any errors
3. Verify data loads correctly
4. Test the "Force Refresh" button

## Setting a Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_URL` | Backend API endpoint | `https://spt-backend.up.railway.app` |

### Backend (Railway/Render/Heroku)

No environment variables required - the backend uses DeFiLlama's public API.

## Monitoring and Maintenance

### Backend
- Check backend logs in your deployment platform
- Backend refreshes data daily at 2:00 AM
- Cache TTL: 24 hours

### Frontend
- Next.js API route caches data for 24 hours
- Client-side sessionStorage persists data across navigation
- Manual refresh available via "Force Refresh" button

## Troubleshooting

### Frontend shows "Failed to fetch data"
- Check that BACKEND_URL is set correctly in Vercel
- Verify backend is running and accessible
- Check backend logs for errors

### Data not updating
- Backend cron job runs at 2:00 AM daily
- Use "Force Refresh" button to manually trigger update
- Check backend logs for API rate limits or errors

### Performance Issues
- Frontend uses 3-layer caching:
  1. Next.js server-side cache (24h)
  2. Client sessionStorage (per session)
  3. Backend in-memory cache (24h)
- All caches can be bypassed with "Force Refresh"

## Next Steps

1. ✅ Frontend deployed to Vercel
2. ⏳ Deploy backend to Railway/Render/Heroku
3. ⏳ Set BACKEND_URL in Vercel
4. ⏳ Redeploy frontend
5. ⏳ Test the live application
6. ⏳ (Optional) Set up custom domain
7. ⏳ (Optional) Set up monitoring/alerts

