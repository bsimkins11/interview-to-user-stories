# Deployment Information

## Current Deployment Status

### What Just Happened
I just deployed the **backend** directly to **Google Cloud Run** using `gcloud run deploy`. This was a **manual deployment** that:
- ✅ Updated the backend code with DOCX support
- ✅ Deployed to: `interview-etl-backend` on Cloud Run
- ❌ **Did NOT** push to GitHub
- ❌ **Did NOT** deploy to Vercel

### Automatic Deployments

#### GitHub Actions (GCP Backend)
- **Trigger**: Pushes to `main` branch
- **Action**: Deploys backend to GCP Cloud Run via `cloudbuild.yaml`
- **Status**: Configured but requires you to push changes to GitHub
- **Workflow**: `.github/workflows/deploy.yml`

#### Vercel (Frontend)
- **Status**: Likely configured (references in config files)
- **Trigger**: Usually automatic on push to GitHub
- **Frontend URL**: `https://interview-to-user-stories.vercel.app` (or similar)

## What Needs to Happen

### To Deploy Backend Changes via GitHub:
```bash
# 1. Commit your changes
git add .
git commit -m "Add DOCX support to backend"

# 2. Push to GitHub
git push origin main

# 3. GitHub Actions will automatically deploy to GCP
```

### To Deploy Frontend Changes:
- If Vercel is connected, pushing to GitHub will auto-deploy
- Or manually deploy via Vercel CLI/Dashboard

## Current State

### Backend
- **Deployed**: ✅ Yes (just now, manually)
- **URL**: `https://interview-etl-backend-bwxhuzcaka-uc.a.run.app`
- **Code in GitHub**: ❌ No (local changes not pushed)

### Frontend  
- **Deployed**: Unknown (need to check Vercel)
- **URL**: Check Vercel dashboard
- **Code in GitHub**: ❌ No (local changes not pushed)

## Next Steps

1. **Push changes to GitHub** to:
   - Update GitHub repository
   - Trigger automatic backend deployment
   - Trigger automatic frontend deployment (if Vercel connected)

2. **Or continue with manual deployments**:
   - Backend: `gcloud run deploy` (what we just did)
   - Frontend: Vercel dashboard or CLI

Would you like me to help push the changes to GitHub?

