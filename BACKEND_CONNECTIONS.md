# Backend Connections Summary

## Current Backend API Endpoint
- **URL**: `https://interview-etl-backend-245695174310.us-central1.run.app`
- **Service**: Google Cloud Run
- **Region**: `us-central1`
- **Project ID**: `interview-to-user-stories`

## GCP Services Configured (but not currently used in main.py)

### 1. **Firestore** (NoSQL Database)
- **Purpose**: Store jobs, constructs, and user stories
- **Collections**:
  - `Jobs` - Job records and status
  - `Constructs` - Output schema definitions
  - `external_imports` - External import records
  - `external_stories` - Imported user stories
- **Service Files**: 
  - `backend/services/job_service.py`
  - `backend/services/construct_service.py`
- **Status**: ⚠️ **Defined but NOT used** - `backend/main.py` uses in-memory storage instead

### 2. **Cloud Storage** (File Storage)
- **Bucket Name**: `interview-to-user-stories-data` (config) or `tp-interview2stories` (code default)
- **Purpose**: Store uploaded transcripts and generated CSV results
- **Paths**:
  - `uploads/{job_id}/interview_data.zip` - Uploaded files
  - `results/{job_id}/user_stories.csv` - Generated results
- **Service File**: `backend/services/storage_service.py`
- **Status**: ⚠️ **Defined but NOT used** - `backend/main.py` doesn't save files

### 3. **Pub/Sub** (Message Queue)
- **Topic**: `interview-processing-jobs`
- **Subscription**: `interview-processing-subscription`
- **Purpose**: Queue jobs for background processing
- **Status**: ⚠️ **Defined but NOT used** - `backend/main.py` uses threading instead

### 4. **Vertex AI / Gemini API**
- **Location**: `us-central1`
- **Purpose**: AI-powered extraction and processing
- **API Key**: Configured via `GEMINI_API_KEY` environment variable
- **Status**: ⚠️ **Not used in main.py** - Uses simple text extraction instead

### 5. **Google Drive/Sheets/Docs APIs**
- **Purpose**: Import user stories from external sources
- **Service File**: `backend/services/external_import_service.py`
- **Status**: ⚠️ **Defined but NOT used** - Not integrated into main.py

## Current Implementation Status

### ✅ What's Actually Working
- **In-Memory Storage**: Jobs, constructs, and files stored in Python dictionaries
- **FastAPI Endpoints**: REST API is functional
- **CORS**: Configured to allow all origins
- **File Upload**: Accepts files but only stores metadata (not content)

### ⚠️ What's Configured But Not Used
The following services have service classes defined but are **NOT integrated** into `backend/main.py`:
1. Firestore (using in-memory dicts instead)
2. Cloud Storage (files not actually saved)
3. Pub/Sub (using threading instead)
4. Vertex AI/Gemini (using simple text extraction)

## Environment Variables

### Required for GCP Services:
```bash
GOOGLE_CLOUD_PROJECT=interview-to-user-stories
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
FIRESTORE_PROJECT_ID=interview-to-user-stories
STORAGE_BUCKET_NAME=interview-to-user-stories-data
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

## Frontend Connection

The frontend connects to the backend via:
- **API Base URL**: `https://interview-etl-backend-245695174310.us-central1.run.app`
- **Endpoints Used**:
  - `POST /upload` - File upload
  - `POST /jobs` - Create processing job
  - `GET /jobs/{job_id}` - Get job status
  - `POST /constructs` - Create construct
  - `POST /generate-requirements` - Generate requirements
  - `POST /chat` - AI assistant chat

## Recommendations

To actually use the GCP services, you need to:
1. **Integrate service classes** into `backend/main.py`
2. **Replace in-memory storage** with Firestore calls
3. **Save uploaded files** to Cloud Storage
4. **Use Pub/Sub** for async job processing
5. **Integrate Gemini API** for actual AI extraction

The service classes are already written and ready to use - they just need to be imported and called in the main.py endpoints.

