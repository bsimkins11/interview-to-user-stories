# Fix Vercel Environment Variable

## Problem
The frontend is using the OLD backend URL because Vercel has an environment variable set:
- **Old (wrong)**: `https://interview-etl-backend-245695174310.us-central1.run.app`
- **New (correct)**: `https://interview-etl-backend-bwxhuzcaka-uc.a.run.app`

## Solution: Update Vercel Environment Variable

### Option 1: Update via Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/dashboard
2. Select your project: `interview-to-user-stories`
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Update it to: `https://interview-etl-backend-bwxhuzcaka-uc.a.run.app`
6. Click **Save**
7. **Redeploy** the project (go to Deployments tab and click "Redeploy" on the latest deployment)

### Option 2: Remove the Environment Variable
If you remove `NEXT_PUBLIC_API_URL` from Vercel, the code will use the default correct URL.

### Option 3: Use Vercel CLI
```bash
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://interview-etl-backend-bwxhuzcaka-uc.a.run.app
```

Then redeploy:
```bash
vercel --prod
```

## After Updating
1. Wait for Vercel to redeploy (usually 1-2 minutes)
2. Clear browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try uploading again

The frontend code is already correct - it just needs the environment variable updated in Vercel!

