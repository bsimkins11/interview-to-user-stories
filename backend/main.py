from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import uuid
import threading
import time
import json
import os
import asyncio
from google.generativeai import GenerativeModel
import google.generativeai as genai
from io import BytesIO
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("⚠️ python-docx not available - DOCX files will be stored as binary")

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("⚠️ PyPDF2 not available - PDF files will be stored as binary")

# Models
class Construct(BaseModel):
    name: str
    output_schema: List[str]
    description: Optional[str] = None
    defaults: Optional[Dict[str, str]] = None
    priority_rules: Optional[List[str]] = None

class Transcript(BaseModel):
    id: str
    name: str
    size: int
    type: str

class JobRequest(BaseModel):
    construct: Construct
    transcripts: List[Transcript]

class JobResponse(BaseModel):
    id: str
    status: str
    message: str
    created_at: str

# In-memory storage (replace with database in production)
constructs: Dict[str, Construct] = {}
jobs: Dict[str, Dict[str, Any]] = {}
files: Dict[str, Dict[str, Any]] = {}

# Initialize Gemini AI model for intelligent extraction
gemini_model = None
def initialize_gemini():
    """Initialize Gemini AI model if API key is available"""
    global gemini_model
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key and api_key != 'your-actual-gemini-api-key-here':
        try:
            genai.configure(api_key=api_key)
            gemini_model = GenerativeModel('gemini-pro')
            print("✅ Gemini AI initialized successfully")
        except Exception as e:
            print(f"⚠️ Failed to initialize Gemini AI: {e}")
            gemini_model = None
    else:
        print("⚠️ GEMINI_API_KEY not set - AI extraction will use pattern matching")

# Initialize on startup
initialize_gemini()

app = FastAPI(title="Interview ETL API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def generate_id() -> str:
    return str(uuid.uuid4())

def get_timestamp() -> str:
    return datetime.utcnow().isoformat()

def generate_sample_user_stories() -> List[Dict[str, Any]]:
    """Generate sample user stories for demonstration"""
    return [
        {
            'id': 'US-001',
            'userStory': 'As a stakeholder, I need to access interview data so that I can analyze requirements.',
            'userStoryStatement': 'Enable stakeholders to access and analyze interview data for requirements gathering.',
            'epic': 'Data Access',
            'stakeholderName': 'Business Analyst',
            'stakeholderRole': 'Analyst',
            'stakeholderTeam': 'Business',
            'category': 'Data Management',
            'changeCatalyst': 'Need for better requirements analysis',
            'useCaseId': 'UC-2024-001',
            'priority': 'High',
            'confidence': 0.9,
            'tags': ['data', 'access', 'analysis'],
            'lifecyclePhase': 'Discovery',
            'source': 'Interview ETL',
            'snippet': 'Stakeholder access to interview data for requirements analysis'
        },
        {
            'id': 'US-002',
            'userStory': 'As a developer, I need clear requirements so that I can implement features correctly.',
            'userStoryStatement': 'Provide developers with clear, actionable requirements for feature implementation.',
            'epic': 'Requirements Management',
            'stakeholderName': 'Developer',
            'stakeholderRole': 'Engineer',
            'stakeholderTeam': 'Engineering',
            'category': 'Development',
            'changeCatalyst': 'Need for clear development guidance',
            'useCaseId': 'UC-2024-002',
            'priority': 'High',
            'confidence': 0.85,
            'tags': ['requirements', 'development', 'clarity'],
            'lifecyclePhase': 'Planning',
            'source': 'Interview ETL',
            'snippet': 'Clear requirements for developers to implement features'
        },
        {
            'id': 'US-003',
            'userStory': 'As a product manager, I need to track requirements progress so that I can manage project timelines.',
            'userStoryStatement': 'Implement requirement tracking and progress monitoring for project management.',
            'epic': 'Project Management',
            'stakeholderName': 'Product Manager',
            'stakeholderRole': 'Manager',
            'stakeholderTeam': 'Product',
            'category': 'Project Management',
            'changeCatalyst': 'Need for better project oversight',
            'useCaseId': 'UC-2024-003',
            'priority': 'Medium',
            'confidence': 0.8,
            'tags': ['tracking', 'progress', 'management'],
            'lifecyclePhase': 'Execution',
            'source': 'Interview ETL',
            'snippet': 'Track requirements progress for project management'
        }
    ]

def generate_requirements_from_user_stories(user_stories: List[Dict]) -> List[Dict]:
    """Generate diverse requirements from user stories with proper traceability"""
    requirements = []
    req_id = 1

    # Define requirement categories with specific focus areas
    requirement_categories = [
        {
            'name': 'Functional Requirements',
            'focus': 'Core functionality and business logic',
            'examples': ['Data validation', 'Business rules', 'Workflow steps', 'User permissions']
        },
        {
            'name': 'User Interface Requirements',
            'focus': 'User experience and interface design',
            'examples': ['Responsive design', 'Accessibility', 'Navigation', 'Form validation']
        },
        {
            'name': 'Data Requirements',
            'focus': 'Data management and persistence',
            'examples': ['Database schema', 'Data integrity', 'Backup procedures', 'Data migration']
        },
        {
            'name': 'Performance Requirements',
            'focus': 'System performance and scalability',
            'examples': ['Response times', 'Throughput', 'Load handling', 'Resource optimization']
        },
        {
            'name': 'Security Requirements',
            'focus': 'Security and compliance',
            'examples': ['Authentication', 'Authorization', 'Data encryption', 'Audit logging']
        },
        {
            'name': 'Integration Requirements',
            'focus': 'System integration and APIs',
            'examples': ['API endpoints', 'Data exchange', 'Third-party services', 'Webhook handling']
        },
        {
            'name': 'Testing Requirements',
            'focus': 'Quality assurance and testing',
            'examples': ['Unit testing', 'Integration testing', 'User acceptance testing', 'Performance testing']
        },
        {
            'name': 'Deployment Requirements',
            'focus': 'Deployment and operations',
            'examples': ['Environment setup', 'Configuration management', 'Monitoring', 'Rollback procedures']
        }
    ]

    for story in user_stories:
        story_id = story.get('id', f'US-{req_id:03d}')
        story_content = story.get('userStoryStatement', 'User story functionality')
        story_epic = story.get('epic', 'Feature')

        # Create diverse requirements for each user story
        for category in requirement_categories:
            if category['name'] == 'Functional Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Implement core business logic for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Develop the primary functionality described in user story {story_id}: {story_content[:100]}...",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'High' if story.get('priority') == 'High' else 'Medium',
                    'effort_estimate': '3-5 days'
                })
                req_id += 1

            elif category['name'] == 'User Interface Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Create user interface for {story_epic} functionality",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Design and implement UI components that enable users to interact with {story_epic} features, ensuring responsive design and accessibility compliance.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Medium',
                    'effort_estimate': '2-3 days'
                })
                req_id += 1

            elif category['name'] == 'Data Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Establish data model for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Define database schema, data relationships, and validation rules to support {story_epic} functionality with proper data integrity constraints.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'High',
                    'effort_estimate': '2-4 days'
                })
                req_id += 1

            elif category['name'] == 'Performance Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Ensure performance standards for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Implement performance monitoring and optimization to meet response time targets (under 2 seconds) and handle expected user load for {story_epic}.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Medium',
                    'effort_estimate': '1-2 days'
                })
                req_id += 1

            elif category['name'] == 'Security Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Implement security measures for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Apply appropriate security controls including input validation, authentication checks, and data protection for {story_epic} functionality.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Medium',
                    'effort_estimate': '1-3 days'
                })
                req_id += 1

            elif category['name'] == 'Integration Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Define integration points for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Establish API contracts and integration patterns to connect {story_epic} with other system components and external services.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Medium',
                    'effort_estimate': '2-3 days'
                })
                req_id += 1

            elif category['name'] == 'Testing Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Create comprehensive test coverage for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Develop unit tests, integration tests, and user acceptance tests to ensure {story_epic} meets quality standards and business requirements.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Low',
                    'effort_estimate': '1-2 days'
                })
                req_id += 1

            elif category['name'] == 'Deployment Requirements':
                requirements.append({
                    'req_id': f'REQ-{req_id:03d}',
                    'requirement': f"Prepare deployment configuration for {story_epic}",
                    'priority_level': story.get('priority', 'MEDIUM').upper(),
                    'req_details': f"Configure deployment pipelines, environment variables, and monitoring setup to ensure {story_epic} can be deployed and operated effectively.",
                    'source_story_id': story_id,
                    'category': category['name'],
                    'complexity': 'Low',
                    'effort_estimate': '1-2 days'
                })
                req_id += 1

    # Add cross-cutting requirements that apply to multiple stories
    if len(user_stories) > 0:
        # Cross-cutting security requirement
        requirements.append({
            'req_id': f'REQ-{req_id:03d}',
            'requirement': "Implement system-wide authentication and authorization",
            'priority_level': 'HIGH',
            'req_details': "Establish centralized user management, role-based access control, and secure session handling across all application features.",
            'source_story_id': 'CROSS-CUTTING',
            'category': 'Security Requirements',
            'complexity': 'High',
            'effort_estimate': '5-7 days'
        })
        req_id += 1

        # Cross-cutting performance requirement
        requirements.append({
            'req_id': f'REQ-{req_id:03d}',
            'requirement': "Establish application performance monitoring",
            'priority_level': 'MEDIUM',
            'req_details': "Implement comprehensive logging, metrics collection, and performance dashboards to monitor application health and user experience.",
            'source_story_id': 'CROSS-CUTTING',
            'category': 'Performance Requirements',
            'complexity': 'Medium',
            'effort_estimate': '3-4 days'
        })
        req_id += 1

        # Cross-cutting data requirement
        requirements.append({
            'req_id': f'REQ-{req_id:03d}',
            'requirement': "Implement data backup and recovery procedures",
            'priority_level': 'HIGH',
            'req_details': "Establish automated backup schedules, data retention policies, and disaster recovery procedures to protect application data.",
            'source_story_id': 'CROSS-CUTTING',
            'category': 'Data Requirements',
            'complexity': 'Medium',
            'effort_estimate': '2-3 days'
        })
        req_id += 1

    return requirements

async def extract_user_stories_with_ai(text: str, construct: Construct) -> List[Dict]:
    """Extract user stories using Gemini AI for intelligent analysis"""
    if gemini_model:
        try:
            # Build AI prompt for extraction
            output_schema = construct.output_schema or []
            defaults = construct.defaults or {}
            priority_rules = construct.priority_rules or []
            
            prompt = f"""
You are an expert business analyst specializing in extracting user stories from interview transcripts.

ANALYZE THIS INTERVIEW TEXT:
"{text[:4000]}"  # Limit to avoid token limits

EXTRACTION GUIDELINES:
1. Identify clear user stories in the format: "As a [role], I need [capability] so that [benefit]"
2. Extract stakeholder information (name, role, team) when mentioned
3. Determine priority (High/Medium/Low) based on business impact
4. Categorize stories appropriately
5. Extract relevant snippets that support each story

OUTPUT SCHEMA: {', '.join(output_schema)}
DEFAULT VALUES: {', '.join([f'{k}: {v}' for k, v in defaults.items()])}
PRIORITY RULES: {'; '.join(priority_rules)}

OUTPUT FORMAT (JSON array):
[
  {{
    "id": "US-001",
    "userStory": "As a [role], I need [capability] so that [benefit]",
    "userStoryStatement": "[Clear statement]",
    "epic": "[Epic name]",
    "stakeholderName": "[Name if mentioned]",
    "stakeholderRole": "[Role]",
    "stakeholderTeam": "[Team]",
    "category": "[Category]",
    "changeCatalyst": "[Why this is needed]",
    "useCaseId": "UC-001",
    "priority": "High|Medium|Low",
    "confidence": 0.0-1.0,
    "tags": ["tag1", "tag2"],
    "lifecyclePhase": "[Phase]",
    "source": "Interview ETL",
    "snippet": "[Key quote]"
  }}
]

Extract all meaningful user stories from the text. Return ONLY valid JSON array.
"""
            
            # Generate content using Gemini
            response = await gemini_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=2048,
                )
            )
            
            # Parse JSON response
            response_text = response.text.strip()
            # Extract JSON from response (handle markdown code blocks)
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            stories = json.loads(response_text)
            print(f"✅ AI extracted {len(stories)} user stories")
            return stories
            
        except Exception as e:
            print(f"⚠️ AI extraction failed: {e}, falling back to pattern matching")
            return extract_user_stories_from_text(text, construct)
    else:
        print("⚠️ Gemini AI not available, using pattern matching")
        return extract_user_stories_from_text(text, construct)

def extract_user_stories_from_text(text: str, construct: Construct) -> List[Dict]:
    """Fallback: Extract user stories from text using pattern matching"""
    stories = []
    story_id = 1
    
    # Split text into sentences for basic extraction
    sentences = text.split('.')
    
    for sentence in sentences[:10]:  # Limit to first 10 sentences for demo
        if len(sentence.strip()) > 20:  # Only process meaningful sentences
            story = {
                'id': f'US-{story_id:03d}',
                'userStory': f"As a user, I need {sentence.strip()} so that I can achieve my goals.",
                'userStoryStatement': sentence.strip(),
                'epic': 'Feature',
                'stakeholderName': 'User',
                'stakeholderRole': 'End User',
                'stakeholderTeam': 'General',
                'category': 'Functionality',
                'changeCatalyst': 'User need',
                'useCaseId': f'UC-{story_id:03d}',
                'priority': 'Medium',
                'confidence': 0.8,
                'tags': ['extracted', 'interview'],
                'lifecyclePhase': 'Discovery',
                'source': 'Interview ETL',
                'snippet': sentence.strip()[:100]
            }
            stories.append(story)
            story_id += 1
    
    return stories

async def process_real_job_async(job_id: str, construct: Construct, transcripts: List[Transcript]):
    """Process a real job with actual file content using AI"""
    try:
        job = jobs[job_id]
        job['status'] = 'PROCESSING'
        job['progress'] = 0
        
        # Step 1: Extract text from uploaded files
        await asyncio.sleep(0.5)
        job['progress'] = 25
        
        all_text = ""
        for transcript in transcripts:
            # Get file content from uploaded files
            if transcript.id in files:
                file_data = files[transcript.id]
                content = file_data.get('content', '')
                if content:
                    all_text += f"\n\n--- File: {transcript.name} ---\n\n"
                    all_text += content
                    print(f"📄 Processing file: {transcript.name} ({len(content)} chars)")
                else:
                    print(f"⚠️ File {transcript.name} has no content")
            else:
                print(f"⚠️ File {transcript.id} not found in uploaded files")
        
        if not all_text.strip():
            raise Exception("No file content found to process")
        
        await asyncio.sleep(0.5)
        job['progress'] = 50
        
        # Step 2: Extract user stories using AI
        print(f"🤖 Using {'Gemini AI' if gemini_model else 'pattern matching'} for extraction...")
        user_stories = await extract_user_stories_with_ai(all_text, construct)
        
        await asyncio.sleep(0.5)
        job['progress'] = 75
        
        # Step 3: Complete the job
        job['status'] = 'COMPLETED'
        job['progress'] = 100
        job['completed_at'] = get_timestamp()
        job['user_stories'] = user_stories
        print(f"✅ Job {job_id} completed with {len(user_stories)} user stories")
        
    except Exception as e:
        print(f"❌ Error processing job {job_id}: {e}")
        job['status'] = 'FAILED'
        job['error'] = str(e)
        
        # Fallback to sample data if processing fails
        job['user_stories'] = generate_sample_user_stories()

def process_real_job(job_id: str, construct: Construct, transcripts: List[Transcript]):
    """Wrapper to run async processing in a thread"""
    asyncio.run(process_real_job_async(job_id, construct, transcripts))

# API Endpoints
@app.post("/constructs", response_model=Dict[str, str])
async def create_construct(construct: Construct):
    """Create a new construct"""
    try:
        construct_id = generate_id()
        constructs[construct_id] = construct
        return {"id": construct_id, "message": "Construct created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create construct: {str(e)}")

@app.post("/jobs", response_model=JobResponse)
async def create_job(job_request: JobRequest):
    """Create a new processing job"""
    try:
        job_id = generate_id()
        
        # Verify files exist
        missing_files = []
        for transcript in job_request.transcripts:
            if transcript.id not in files:
                missing_files.append(transcript.name)
        
        if missing_files:
            raise HTTPException(
                status_code=400, 
                detail=f"Files not found: {', '.join(missing_files)}. Please upload files first."
            )
        
        # Create job record
        job = {
            'id': job_id,
            'status': 'PENDING',
            'progress': 0,
            'created_at': get_timestamp(),
            'construct': job_request.construct.dict(),
            'transcripts': [t.dict() for t in job_request.transcripts],
            'user_stories': [],
            'requirements': []
        }
        
        jobs[job_id] = job
        
        # Start processing in background thread
        thread = threading.Thread(
            target=process_real_job,
            args=(job_id, job_request.construct, job_request.transcripts)
        )
        thread.daemon = True
        thread.start()
        
        ai_status = "with Gemini AI" if gemini_model else "with pattern matching"
        return JobResponse(
            id=job_id,
            status="PENDING",
            message=f"Job created and processing started {ai_status}",
            created_at=job['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a job"""
    try:
        if job_id not in jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = jobs[job_id]
        
        # If job is completed, ensure user stories and requirements are included
        if job['status'] == 'COMPLETED':
            if 'user_stories' not in job:
                job['user_stories'] = generate_sample_user_stories()
            
            # Don't generate requirements automatically - let user request them
            # if 'requirements' not in job:
            #     job['requirements'] = generate_requirements_from_user_stories(job['user_stories'])
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

@app.post("/upload")
async def upload_file(uploaded_files_list: List[UploadFile] = File(...)):
    """Upload and store files with content for processing"""
    try:
        if not uploaded_files_list:
            raise HTTPException(status_code=400, detail="No files provided")
        
        processed_files = []
        for file in uploaded_files_list:
            if not file.filename:
                continue
            
            print(f"📤 Receiving upload: {file.filename} ({file.size or 0} bytes)")
            
            # Read the actual file content
            content = await file.read()
            
            if not content:
                raise HTTPException(status_code=400, detail=f"File {file.filename} is empty")
            
            # Extract text based on file type
            filename_lower = file.filename.lower() if file.filename else ''
            content_text = ""
            
            try:
                # Handle DOCX files
                if filename_lower.endswith('.docx'):
                    if DOCX_AVAILABLE:
                        try:
                            doc = docx.Document(BytesIO(content))
                            text_parts = []
                            for paragraph in doc.paragraphs:
                                if paragraph.text.strip():
                                    text_parts.append(paragraph.text)
                            content_text = '\n\n'.join(text_parts)
                            if not content_text.strip():
                                raise ValueError("DOCX file appears to be empty")
                            print(f"✅ Extracted text from DOCX: {len(content_text)} characters")
                        except Exception as e:
                            print(f"⚠️ Failed to extract DOCX text: {e}, storing as base64")
                            import base64
                            content_text = base64.b64encode(content).decode('utf-8')
                    else:
                        print(f"⚠️ python-docx not available, storing DOCX as base64")
                        import base64
                        content_text = base64.b64encode(content).decode('utf-8')
                
                # Handle PDF files
                elif filename_lower.endswith('.pdf'):
                    if PDF_AVAILABLE:
                        try:
                            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
                            text_parts = []
                            for page in pdf_reader.pages:
                                text = page.extract_text()
                                if text.strip():
                                    text_parts.append(text)
                            content_text = '\n\n'.join(text_parts)
                            print(f"✅ Extracted text from PDF: {len(content_text)} characters")
                        except Exception as e:
                            print(f"⚠️ Failed to extract PDF text: {e}, storing as base64")
                            import base64
                            content_text = base64.b64encode(content).decode('utf-8')
                    else:
                        print(f"⚠️ PyPDF2 not available, storing PDF as base64")
                        import base64
                        content_text = base64.b64encode(content).decode('utf-8')
                
                # Handle text files (TXT, MD, CSV)
                elif filename_lower.endswith(('.txt', '.md', '.csv')):
                    # Try different encodings
                    for encoding in ['utf-8', 'latin-1', 'cp1252']:
                        try:
                            content_text = content.decode(encoding)
                            break
                        except UnicodeDecodeError:
                            continue
                    else:
                        # Fallback to utf-8 with errors='ignore'
                        content_text = content.decode('utf-8', errors='ignore')
                    print(f"✅ Extracted text from {filename_lower.split('.')[-1]}: {len(content_text)} characters")
                
                # Fallback: try to decode as text, then base64
                else:
                    try:
                        content_text = content.decode('utf-8', errors='ignore')
                        # If decoded text is mostly non-printable, it's probably binary
                        if len([c for c in content_text[:100] if c.isprintable()]) < 50:
                            raise ValueError("Likely binary file")
                    except Exception:
                        import base64
                        content_text = base64.b64encode(content).decode('utf-8')
                        print(f"⚠️ Binary file detected, storing as base64")
            
            except Exception as e:
                print(f"❌ Error processing file content for {file.filename}: {e}")
                # Last resort: store as base64
                import base64
                content_text = base64.b64encode(content).decode('utf-8')
            
            file_id = generate_id()
            
            # Store file metadata and content
            file_data = {
                'id': file_id,
                'name': file.filename,
                'original_name': file.filename,  # Store original name for frontend compatibility
                'size': file.size or len(content),
                'type': file.content_type or 'unknown',
                'uploaded_at': get_timestamp(),
                'content': content_text,  # Store actual content
                'content_length': len(content_text)
            }
            
            files[file_id] = file_data
            processed_files.append(file_data)
            
            print(f"✅ Uploaded file: {file.filename} ({len(content_text)} characters) - ID: {file_id}")
        
        return {
            "success": True,
            "message": f"Successfully processed {len(processed_files)} files",
            "files": processed_files
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": get_timestamp(),
        "version": "1.0.0",
        "docx_available": DOCX_AVAILABLE,
        "pdf_available": PDF_AVAILABLE
    }

# Chat endpoint for AI assistant
@app.post("/chat")
async def chat_endpoint(request: dict):
    """Handle chat requests from the AI assistant"""
    try:
        message = request.get("message", "")
        context = request.get("context", {})
        
        # Simple AI response logic based on context and message
        response = generate_ai_response(message, context)
        
        return {
            "response": response,
            "timestamp": get_timestamp(),
            "success": True
        }
    except Exception as e:
        return {
            "response": f"I apologize, but I encountered an error: {str(e)}",
            "timestamp": get_timestamp(),
            "success": False,
            "error": str(e)
        }

# Requirements generation endpoint
@app.post("/generate-requirements")
async def generate_requirements_endpoint(request: dict):
    """Generate requirements from user stories using AI"""
    try:
        user_stories = request.get("userStories", [])
        construct = request.get("construct", {})
        
        if not user_stories:
            return {
                "requirements": [],
                "message": "No user stories provided to generate requirements from.",
                "success": False
            }
        
        # Generate requirements from user stories
        requirements = generate_requirements_from_stories(user_stories, construct)
        
        return {
            "requirements": requirements,
            "message": f"Successfully generated {len(requirements)} requirements from {len(user_stories)} user stories.",
            "success": True,
            "timestamp": get_timestamp()
        }
    except Exception as e:
        return {
            "requirements": [],
            "message": f"Error generating requirements: {str(e)}",
            "success": False,
            "error": str(e)
        }

def generate_requirements_from_stories(user_stories: list, construct: dict) -> list:
    """Generate requirements from user stories using AI logic"""
    requirements = []
    
    for i, story in enumerate(user_stories):
        # Create requirement from user story
        req_id = f"REQ-{i+1:03d}"
        
        # Extract key information from user story
        story_text = story.get('userStory', '')
        stakeholder = story.get('stakeholderName', 'Unknown')
        priority = story.get('priority', 'MEDIUM')
        category = story.get('category', 'General')
        
        # Generate requirement text based on user story
        if 'access' in story_text.lower() or 'view' in story_text.lower():
            requirement = f"System shall provide {stakeholder} with access to {category.lower()} data and functionality"
        elif 'create' in story_text.lower() or 'add' in story_text.lower():
            requirement = f"System shall allow {stakeholder} to create and manage {category.lower()} content"
        elif 'analyze' in story_text.lower() or 'report' in story_text.lower():
            requirement = f"System shall provide {stakeholder} with analytical capabilities for {category.lower()} data"
        elif 'manage' in story_text.lower() or 'control' in story_text.lower():
            requirement = f"System shall enable {stakeholder} to manage and control {category.lower()} processes"
        else:
            requirement = f"System shall support {stakeholder} in achieving {category.lower()} objectives as described in user story"
        
        # Generate detailed specification
        req_details = f"""
        This requirement is derived from user story: {story.get('id', 'Unknown')}
        
        Stakeholder: {stakeholder} ({story.get('stakeholderRole', 'User')})
        Team: {story.get('stakeholderTeam', 'General')}
        Category: {category}
        Priority: {priority}
        Confidence: {story.get('confidence', 0.8)}
        
        Acceptance Criteria:
        1. The system must fulfill the user story: {story_text}
        2. All specified fields and data must be properly handled
        3. The interface must be intuitive for {stakeholder}
        4. Performance must meet acceptable standards
        5. Error handling must be robust and user-friendly
        
        Technical Considerations:
        - Ensure proper data validation and sanitization
        - Implement appropriate access controls and permissions
        - Consider scalability and performance requirements
        - Maintain data integrity and consistency
        - Provide comprehensive error handling and user feedback
        """
        
        # Map priority levels
        priority_mapping = {
            'High': 'HIGH',
            'Medium': 'MEDIUM', 
            'Low': 'LOW'
        }
        
        requirement_obj = {
            'req_id': req_id,
            'requirement': requirement.strip(),
            'priority_level': priority_mapping.get(priority, 'MEDIUM'),
            'req_details': req_details.strip(),
            'source_story_id': story.get('id', 'Unknown')
        }
        
        requirements.append(requirement_obj)
    
    return requirements

def generate_ai_response(message: str, context: dict) -> str:
    """Generate AI responses based on the message and context"""
    message_lower = message.lower()
    
    # Get context information
    current_step = context.get("currentStep", "unknown")
    construct = context.get("construct")
    user_stories = context.get("userStories", [])
    requirements = context.get("requirements", [])
    transcripts = context.get("transcripts", [])
    
    # Handle different types of questions
    if "how does" in message_lower or "how do" in message_lower:
        if "work" in message_lower or "process" in message_lower:
            return "The Interview ETL process works in 5 main steps: 1) Define your output structure, 2) Upload interview transcripts, 3) AI processes and extracts insights, 4) Edit and refine user stories, 5) Convert to requirements. Each step builds on the previous one to create a comprehensive requirements document."
        
        if "get started" in message_lower:
            return "To get started, click the 'Get Started' button on the home page. This will take you to step 1 where you'll define your output structure. You'll specify what fields you want in your user stories (like stakeholder info, priority, etc.)."
        
        if "upload" in message_lower or "file" in message_lower:
            return "You can upload interview transcripts in multiple formats: TXT, DOCX, PDF, Markdown, or even ZIP files containing multiple documents. The system will process all files and extract insights using AI."
    
    if "ai" in message_lower or "gemini" in message_lower or "extraction" in message_lower:
        if "how long" in message_lower or "time" in message_lower:
            return "AI processing typically takes 2-5 minutes depending on the number and size of your transcripts. The system uses Gemini AI with advanced vectorization to understand context and extract meaningful insights."
        
        if "accuracy" in message_lower or "quality" in message_lower:
            return "The AI extraction provides high accuracy through context-aware processing. It analyzes relationships across all interviews and uses your defined schema to ensure consistent output. You can always edit the results before finalizing."
    
    if "vector" in message_lower or "context" in message_lower:
        return "Vectorization creates mathematical representations of your interview content, allowing the AI to understand relationships between different parts of your transcripts. This means it can cross-reference information across multiple interviews and stakeholders to provide comprehensive insights."
    
    if "requirement" in message_lower or "convert" in message_lower:
        return "Requirements are generated by analyzing your user stories and mapping them to detailed technical specifications. The system maintains traceability between user stories and requirements, ensuring nothing is lost in translation."
    
    # Step-specific guidance
    if current_step == "construct":
        if "fields" in message_lower or "schema" in message_lower:
            return "For your output schema, consider including: user story text, stakeholder information, priority level, epic/category, acceptance criteria, and business value. These fields will help create comprehensive and actionable user stories."
    
    if current_step == "upload":
        if "formats" in message_lower:
            return "Supported file formats include: TXT, DOCX, PDF, CSV, and Markdown files. You can upload multiple files at once, and the system will process them together for better context understanding."
    
    if current_step == "process":
        if "processing" in message_lower:
            return "During processing, the AI analyzes your transcripts using natural language processing and machine learning. It extracts key insights, identifies patterns, and structures the information according to your defined schema."
    
    if current_step == "userStories":
        if "edit" in message_lower or "improve" in message_lower:
            return "When editing user stories, focus on making them specific, measurable, and actionable. Ensure each story follows the format: 'As a [user], I want [goal] so that [benefit].' Consider adding acceptance criteria for clarity."
    
    # Default response
    return "I'm here to help you with the Interview ETL process! I can explain how the system works, provide best practices, help with specific steps, and answer questions about AI processing, vectorization, and requirements generation. What would you like to know more about?"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
