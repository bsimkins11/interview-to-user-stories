# GCP Project and Account Information

## Current Configuration

### GCP Project ID
**Configured in app**: `interview-to-user-stories`
- Set in `config/production.env`
- Set in `config/local.env`
- Used in Cloud Build (`cloudbuild.yaml`)

### GCP Region
**Region**: `us-central1`
- All services deployed to `us-central1`

### Current gcloud Configuration
**Active Project**: `transparent-agent-test`
**Active Account**: `bryan.simkins@transparent.partners`

⚠️ **Note**: There's a mismatch between configured project (`interview-to-user-stories`) and active gcloud project (`transparent-agent-test`).

## Deployed Services

### Cloud Run Services
1. **Backend API**: `interview-etl-backend`
   - URL: `https://interview-etl-backend-bwxhuzcaka-uc.a.run.app`
   - Region: `us-central1`

2. **Frontend**: `interview-etl-frontend`
   - URL: `https://interview-etl-frontend-bwxhuzcaka-uc.a.run.app`
   - Region: `us-central1`

3. **Worker**: `interview-etl-worker`
   - URL: `https://interview-etl-worker-bwxhuzcaka-uc.a.run.app`
   - Region: `us-central1`

### Service Account
**Name**: `interview-etl-service@[PROJECT_ID].iam.gserviceaccount.com`
- Used by Cloud Run services
- Needs permissions for: Firestore, Cloud Storage, Pub/Sub

## GCP Services Used

### 1. Cloud Run
- **Purpose**: Host backend API, frontend, and worker
- **Project**: Check which project the services are actually deployed to

### 2. Firestore
- **Project ID**: `interview-to-user-stories` (configured)
- **Database**: `(default)`
- **Collections**: `Jobs`, `Constructs`, `external_imports`, `external_stories`

### 3. Cloud Storage
- **Bucket**: `interview-to-user-stories-data` (configured)
- **Purpose**: Store uploaded files and results

### 4. Pub/Sub
- **Project ID**: `interview-to-user-stories` (configured)
- **Topic**: `interview-processing-jobs`
- **Subscription**: `interview-processing-subscription`

### 5. Vertex AI
- **Location**: `us-central1`
- **Project ID**: `interview-to-user-stories` (configured)

## How to Verify Project Access

### 1. Check if you have access to the project:
```bash
gcloud projects get-iam-policy interview-to-user-stories
```

### 2. List services in the project:
```bash
gcloud run services list --project=interview-to-user-stories --region=us-central1
```

### 3. Check billing:
```bash
gcloud billing projects describe interview-to-user-stories
```

### 4. Verify APIs are enabled:
```bash
gcloud services list --project=interview-to-user-stories --enabled
```

## Required APIs

Make sure these APIs are enabled in the GCP project:
- ✅ Cloud Run API (`run.googleapis.com`)
- ✅ Cloud Build API (`cloudbuild.googleapis.com`)
- ✅ Firestore API (`firestore.googleapis.com`)
- ✅ Cloud Storage API (`storage.googleapis.com`)
- ✅ Pub/Sub API (`pubsub.googleapis.com`)
- ✅ Vertex AI API (`aiplatform.googleapis.com`)
- ✅ Container Registry API (`containerregistry.googleapis.com`)

## To Switch Projects

If you need to switch to the correct project:
```bash
gcloud config set project interview-to-user-stories
```

## To Verify Current Setup

Run this command to see what project the services are actually in:
```bash
gcloud run services describe interview-etl-backend \
  --region=us-central1 \
  --format="value(metadata.namespace)"
```

This will show the actual GCP project ID where the service is deployed.

