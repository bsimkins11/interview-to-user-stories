# Upload Debugging Guide

## Current Issue
DOCX file upload is showing "error" status in the UI.

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and look for:
- `Uploading file: nestle_ai_discovery_transcript.docx`
- `Upload response status: [status code]`
- Any error messages

### 2. Check Backend Logs
Look for these messages:
- `📤 Receiving upload: nestle_ai_discovery_transcript.docx`
- `✅ Extracted text from DOCX: [number] characters` OR
- `⚠️ Failed to extract DOCX text: [error]`
- `✅ Uploaded file: [filename]`

### 3. Test Health Endpoint
```bash
curl https://interview-etl-backend-245695174310.us-central1.run.app/health
```

Should return:
```json
{
  "status": "healthy",
  "docx_available": true,
  "pdf_available": true
}
```

### 4. Test Upload Directly
```bash
curl -X POST \
  https://interview-etl-backend-245695174310.us-central1.run.app/upload \
  -F "file=@nestle_ai_discovery_transcript.docx"
```

### 5. Common Issues

#### Issue: CORS Error
- **Symptom**: Network error in browser console
- **Fix**: Check backend CORS configuration allows your domain

#### Issue: File Too Large
- **Symptom**: 413 Request Entity Too Large
- **Fix**: Check file size limits (currently 10MB per file)

#### Issue: DOCX Library Not Available
- **Symptom**: Backend logs show "python-docx not available"
- **Fix**: Install `python-docx` in backend requirements

#### Issue: Network Error
- **Symptom**: Failed to fetch
- **Fix**: Check API_BASE_URL is correct and backend is running

#### Issue: Response Format Mismatch
- **Symptom**: Upload succeeds but frontend shows error
- **Fix**: Check response has `id` and `name` fields

## Expected Response Format
```json
{
  "id": "uuid-here",
  "name": "nestle_ai_discovery_transcript.docx",
  "size": 52645,
  "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "message": "File uploaded successfully"
}
```

## Error Response Format
```json
{
  "detail": "Error message here"
}
```

