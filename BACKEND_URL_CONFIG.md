# Backend URL Configuration Guide

## Current Issue
The frontend is hardcoded to use: `https://interview-etl-backend-245695174310.us-central1.run.app`

After GCP backend config changes, this URL may be incorrect or the backend may need to be redeployed.

## How to Find Your Backend URL

### Option 1: Using gcloud CLI
```bash
gcloud run services list --project=interview-to-user-stories --region=us-central1
```

### Option 2: Using GCP Console
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select project: `interview-to-user-stories`
3. Find service: `interview-etl-backend`
4. Copy the URL from the service details

### Option 3: Check Cloud Build
```bash
gcloud builds list --project=interview-to-user-stories --limit=5
```

## How to Update Frontend

### For Local Development
Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=https://your-new-backend-url.run.app
```

### For Vercel Production
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-new-backend-url.run.app`
3. Redeploy

### For Testing
You can also test with curl:
```bash
curl https://your-backend-url.run.app/health
```

## Current Backend Status
The backend at `https://interview-etl-backend-245695174310.us-central1.run.app` is returning a 500 error, which means:
- ✅ The service exists and is reachable
- ❌ The service has an error (needs debugging or redeployment)

## Next Steps
1. Find the correct backend URL from GCP
2. Update `.env.local` or Vercel environment variables
3. Redeploy frontend if needed
4. Test the connection

