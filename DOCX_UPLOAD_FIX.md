# DOCX Upload Fix

## Issue
DOCX files are failing to upload because the deployed backend (`backend-simple`) doesn't handle DOCX files properly - it tries to decode them as UTF-8 text, which fails for binary files.

## Solution Applied

### 1. Added DOCX/PDF Support to backend-simple
- Added `python-docx==1.1.0` to `backend-simple/requirements.txt`
- Added `PyPDF2==3.0.1` to `backend-simple/requirements.txt`
- Updated upload handler to properly extract text from DOCX and PDF files
- Added proper error handling with fallback to base64 encoding

### 2. Updated Upload Handler
The upload handler now:
- Detects file type by extension
- Extracts text from DOCX files using python-docx
- Extracts text from PDF files using PyPDF2
- Falls back to base64 encoding if extraction fails
- Handles text files (TXT, MD, CSV) with proper encoding detection

## Next Steps

### Option 1: Redeploy Backend (Recommended)
Redeploy the backend with the updated code:
```bash
gcloud run deploy interview-etl-backend \
  --source ./backend-simple \
  --region us-central1 \
  --project interview-to-user-stories
```

### Option 2: Test Locally First
Test the changes locally before deploying:
```bash
cd backend-simple
pip install -r requirements.txt
uvicorn main:app --reload
```

## What Changed

**backend-simple/main.py**:
- Added DOCX and PDF text extraction
- Added proper file type detection
- Added fallback handling for binary files

**backend-simple/requirements.txt**:
- Added `python-docx==1.1.0`
- Added `PyPDF2==3.0.1`

## Testing

After redeploying, test with:
```bash
curl -X POST https://interview-etl-backend-bwxhuzcaka-uc.a.run.app/upload \
  -F "files=@your-file.docx"
```

The backend should now properly extract text from DOCX files instead of trying to decode them as UTF-8.

