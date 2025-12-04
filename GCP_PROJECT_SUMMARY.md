# GCP Project and Account Summary

## ✅ GCP Project Information

### Project Details
- **Project ID**: `interview-to-user-stories`
- **Project Name**: `interview-to-user-stories`
- **Project Number**: `289778453333`
- **Region**: `us-central1`

### Account Information
- **Current Account**: `bryan.simkins@transparent.partners`
- **Active gcloud Project**: `transparent-agent-test` (may need to switch)

## 🚀 Deployed Services

All services are deployed in the **`interview-to-user-stories`** project:

1. **Backend API**
   - Service: `interview-etl-backend`
   - URL: `https://interview-etl-backend-bwxhuzcaka-uc.a.run.app`
   - Status: ✅ Running

2. **Frontend**
   - Service: `interview-etl-frontend`
   - URL: `https://interview-etl-frontend-bwxhuzcaka-uc.a.run.app`
   - Status: ✅ Running

3. **Worker**
   - Service: `interview-etl-worker`
   - URL: `https://interview-etl-worker-bwxhuzcaka-uc.a.run.app`
   - Status: ✅ Running

## 🔧 To Verify Access

### 1. Switch to the correct project:
```bash
gcloud config set project interview-to-user-stories
```

### 2. Verify you have access:
```bash
gcloud projects get-iam-policy interview-to-user-stories
```

### 3. Check billing is enabled:
```bash
gcloud billing projects describe interview-to-user-stories
```

### 4. Verify required APIs are enabled:
```bash
gcloud services list --project=interview-to-user-stories --enabled | grep -E "(run|firestore|storage|pubsub|aiplatform)"
```

## 📋 Required GCP APIs

Make sure these APIs are enabled in `interview-to-user-stories`:

- ✅ **Cloud Run API** (`run.googleapis.com`)
- ✅ **Cloud Build API** (`cloudbuild.googleapis.com`)
- ✅ **Firestore API** (`firestore.googleapis.com`)
- ✅ **Cloud Storage API** (`storage.googleapis.com`)
- ✅ **Pub/Sub API** (`pubsub.googleapis.com`)
- ✅ **Vertex AI API** (`aiplatform.googleapis.com`)
- ✅ **Container Registry API** (`containerregistry.googleapis.com`)

## 🔗 Quick Links

- **GCP Console**: https://console.cloud.google.com/home/dashboard?project=interview-to-user-stories
- **Cloud Run**: https://console.cloud.google.com/run?project=interview-to-user-stories
- **Firestore**: https://console.cloud.google.com/firestore?project=interview-to-user-stories
- **Cloud Storage**: https://console.cloud.google.com/storage?project=interview-to-user-stories

## ⚠️ Important Notes

1. **Current gcloud config** shows `transparent-agent-test` - you may need to switch to `interview-to-user-stories` for deployments
2. **Service Account**: `interview-etl-service@interview-to-user-stories.iam.gserviceaccount.com` needs proper IAM roles
3. **Billing**: Make sure billing is enabled for the project
4. **APIs**: All required APIs must be enabled for the app to work properly

## 🎯 Next Steps

1. ✅ Verify you have access to `interview-to-user-stories` project
2. ✅ Check billing is enabled
3. ✅ Ensure all APIs are enabled
4. ✅ Verify service account has proper permissions

