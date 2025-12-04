# Interview ETL - AI-Powered User Story Generation

## Overview
Interview ETL is an intelligent application that transforms stakeholder interview transcripts into structured user stories and requirements using advanced AI processing. The system provides a guided, 5-step workflow that helps product managers, business analysts, and development teams extract actionable insights from qualitative interview data.

## 🎯 What It Does
- **Automatically extracts** user stories from interview transcripts
- **Converts unstructured text** into organized, actionable requirements
- **Provides AI-powered insights** using Google's Gemini AI
- **Supports multiple file formats** including TXT, DOCX, PDF, Markdown, CSV, and ZIP
- **Enables collaborative editing** of extracted content
- **Generates exportable outputs** for project management tools

## 🏗️ Architecture

### Frontend (Next.js 14 + React 18 + TypeScript)
- **Modern UI Framework**: Built with Next.js 14 for optimal performance and SEO
- **Component-Based**: Modular React components for maintainability
- **Type Safety**: Full TypeScript implementation for robust development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live status updates and progress tracking

### Backend (FastAPI + Python 3.11+)
- **High-Performance API**: FastAPI for rapid API development
- **Async Processing**: Non-blocking operations for better user experience
- **Data Validation**: Pydantic models for request/response validation
- **RESTful Endpoints**: Clean, intuitive API design

### AI Processing (Google Gemini + Vertex AI)
- **Natural Language Processing**: Advanced text analysis and extraction
- **Vector Embeddings**: Semantic search and context understanding
- **Intelligent Extraction**: Pattern recognition for user story identification
- **Confidence Scoring**: Quality metrics for extracted content

### Cloud Infrastructure (Google Cloud Platform)
- **Serverless Deployment**: Cloud Run for scalable, cost-effective hosting
- **Data Storage**: Firestore for structured data, Cloud Storage for files
- **Message Queuing**: Pub/Sub for asynchronous job processing
- **Monitoring**: Cloud Build for CI/CD and deployment automation

## 🔄 5-Step Workflow

### Step 1: Define Output Structure (Construct)
**Purpose**: Define the schema for extracted user stories and requirements

**What Happens**:
- User creates a "construct" that defines output fields
- Fields can include: user story text, stakeholder info, epic, priority, confidence, tags
- Validation rules can be set for data quality
- Pattern matching can be configured for consistent extraction

**AI Assistant Role**:
- Explain best practices for schema design
- Suggest common field types and validation rules
- Help users think through their data requirements
- Provide examples of effective constructs

**User Guidance**:
- Start with essential fields (user story, stakeholder, priority)
- Add custom fields specific to your project needs
- Consider validation rules for data consistency
- Think about how the data will be used downstream

### Step 2: Upload Interview Transcripts
**Purpose**: Provide the raw interview data for AI processing

**What Happens**:
- Users upload interview files (TXT, DOCX, PDF, MD, CSV, ZIP)
- System validates file formats and sizes
- Files are queued for AI processing
- Progress tracking shows upload status

**AI Assistant Role**:
- Explain supported file formats and size limits
- Guide users on file preparation best practices
- Help troubleshoot upload issues
- Explain what happens during processing

**User Guidance**:
- Supported formats: TXT, DOCX, PDF, Markdown, CSV, ZIP
- Size limits: 50MB per file, 500MB total
- Prepare transcripts with clear speaker identification
- Organize files logically (e.g., by stakeholder or interview date)

### Step 3: AI Processing & Extraction
**Purpose**: Transform raw transcripts into structured user stories

**What Happens**:
- AI analyzes uploaded transcripts using defined schema
- Natural language processing extracts key information
- User stories are generated with confidence scores
- Processing typically takes 2-5 minutes
- Real-time progress updates are provided

**AI Assistant Role**:
- Explain what's happening during processing
- Help users understand confidence scores
- Guide users on interpreting results
- Suggest next steps based on output quality

**User Guidance**:
- Processing time varies with file count and size
- Review confidence scores for quality assessment
- High confidence scores indicate reliable extraction
- Low confidence may require manual review or schema adjustment

### Step 4: Edit & Refine User Stories
**Purpose**: Review, edit, and enhance AI-generated user stories

**What Happens**:
- Users can edit any field in generated user stories
- Inline editing with real-time updates
- Bulk operations for multiple stories
- Validation against defined schema
- Export capabilities for external tools

**AI Assistant Role**:
- Explain user story best practices (INVEST criteria)
- Help users improve story quality and clarity
- Guide users on prioritization and organization
- Suggest refinements based on business context

**User Guidance**:
- **INVEST Criteria**: Independent, Negotiable, Valuable, Estimable, Small, Testable
- Focus on user value and clear acceptance criteria
- Ensure stories are actionable and specific
- Consider stakeholder perspectives and business impact
- Use tags and epics for organization

### Step 5: Generate Requirements
**Purpose**: Convert user stories into detailed technical requirements

**What Happens**:
- Users define requirements structure (similar to step 1)
- System converts user stories to requirements
- Technical specifications are generated
- Requirements can be reviewed and edited
- Final outputs are exported as CSV files

**AI Assistant Role**:
- Explain the relationship between user stories and requirements
- Guide users on requirements structure design
- Help users understand technical specification needs
- Suggest validation and review processes

**User Guidance**:
- Requirements provide technical implementation details
- Include traceability to source user stories
- Define acceptance criteria and success metrics
- Consider non-functional requirements (performance, security, etc.)
- Review for completeness and clarity

## 🚀 Key Features

### AI-Powered Extraction
- **Intelligent Pattern Recognition**: Identifies user stories, stakeholders, and key information
- **Context Awareness**: Understands interview context and business domain
- **Confidence Scoring**: Provides quality metrics for extracted content
- **Continuous Learning**: Improves accuracy with more data

### Collaborative Editing
- **Real-time Updates**: Changes are immediately reflected across the application
- **Inline Editing**: Click any field to modify content
- **Bulk Operations**: Select multiple items for batch updates
- **Version History**: Track changes and revert if needed

### File Management
- **Multiple Formats**: Support for common document types
- **Batch Processing**: Handle multiple files simultaneously
- **Progress Tracking**: Real-time upload and processing status
- **Error Handling**: Graceful failure with helpful error messages

### Export & Integration
- **CSV Export**: Download user stories and requirements
- **API Access**: RESTful endpoints for external integrations
- **Project Management Tools**: Compatible with Jira, Azure DevOps, etc.
- **Data Portability**: Easy migration between systems

## 🎨 User Interface

### Navigation
- **Step-by-Step Flow**: Clear progression through the workflow
- **Progress Indicators**: Visual feedback on current position
- **Breadcrumb Navigation**: Easy movement between steps
- **Context-Aware Help**: Relevant assistance at each stage

### AI Assistant Integration
- **Floating Chat Button**: Always accessible AI help
- **Context-Aware Responses**: Understands current step and data
- **Interactive Guidance**: Can explain, suggest, and help edit
- **Real-time Assistance**: Immediate help when needed

### Responsive Design
- **Mobile-First**: Works seamlessly on all devices
- **Touch-Friendly**: Optimized for tablet and mobile use
- **Accessibility**: WCAG compliant design patterns
- **Cross-Browser**: Consistent experience across platforms

## 🔧 Technical Implementation

### Data Models

#### User Story
```typescript
interface UserStory {
  id: string;
  userStory: string;
  stakeholder: string;
  epic: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  tags: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Requirement
```typescript
interface Requirement {
  req_id: string;
  requirement: string;
  priority_level: string;
  req_details: string;
  source_story_id: string;
  technical_specs: string;
  acceptance_criteria: string;
}
```

#### Construct
```typescript
interface Construct {
  name: string;
  output_schema: FieldDefinition[];
  pattern: string;
  validation_rules: ValidationRule[];
  metadata: Record<string, any>;
}
```

### API Endpoints

#### Core Operations
- `POST /api/jobs` - Create processing job
- `GET /api/jobs/{id}` - Get job status and results
- `POST /api/constructs` - Create or update construct
- `POST /api/chat` - AI assistant communication

#### File Management
- `POST /api/upload` - Upload interview files
- `GET /api/files` - List uploaded files
- `DELETE /api/files/{id}` - Remove file

#### Data Export
- `GET /api/export/user-stories` - Download user stories as CSV
- `GET /api/export/requirements` - Download requirements as CSV

### Security & Permissions
- **Authentication**: Google Cloud IAM integration
- **Authorization**: Role-based access control
- **Data Encryption**: At-rest and in-transit encryption
- **Audit Logging**: Complete activity tracking
- **GDPR Compliance**: Data privacy and retention controls

## 📊 Performance & Scalability

### Processing Performance
- **Typical Processing Time**: 2-5 minutes for standard interviews
- **Concurrent Jobs**: Support for multiple simultaneous processing jobs
- **File Size Limits**: Up to 50MB per file, 500MB total per job
- **Batch Processing**: Efficient handling of multiple files

### Scalability Features
- **Auto-scaling**: Cloud Run automatically scales based on demand
- **Load Balancing**: Distributed processing across multiple instances
- **Caching**: Redis-based caching for frequently accessed data
- **Database Optimization**: Indexed queries for fast data retrieval

### Monitoring & Observability
- **Real-time Metrics**: Processing time, success rates, error counts
- **Alerting**: Proactive notification of issues
- **Logging**: Comprehensive application and access logs
- **Performance Tracking**: Response time and throughput monitoring

## 🚀 Getting Started

### Prerequisites
- Google Cloud Platform account
- Node.js 18+ and npm
- Python 3.11+ (for backend development)
- Docker (for containerized deployment)

### Local Development Setup
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Interview-ETL-User-Stories
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   cp config/local.env.example config/local.env
   # Edit local.env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Frontend (Terminal 1)
   npm run dev
   
   # Backend (Terminal 2)
   cd backend
   uvicorn main:app --reload
   ```

### Production Deployment
1. **Google Cloud Setup**
   - Create GCP project
   - Enable required APIs (Cloud Run, Cloud Build, etc.)
   - Set up service account with appropriate permissions

2. **Deploy Services**
   ```bash
   # Deploy frontend
   gcloud run deploy interview-etl-frontend --source . --region=us-central1
   
   # Deploy backend and worker via Cloud Build
   gcloud builds submit --config cloudbuild.yaml
   ```

3. **Configure Environment Variables**
   - Set production environment variables
   - Configure API keys and service accounts
   - Set up monitoring and alerting

## 🎯 Best Practices

### Interview Preparation
- **Structured Questions**: Use consistent interview guides
- **Stakeholder Identification**: Clearly identify all participants
- **Context Documentation**: Record business context and objectives
- **Audio Quality**: Ensure clear, high-quality recordings

### Schema Design
- **Start Simple**: Begin with essential fields
- **Be Specific**: Use clear, unambiguous field names
- **Consider Validation**: Include rules for data quality
- **Plan for Growth**: Design schemas that can evolve

### Data Quality
- **Review AI Output**: Always validate extracted content
- **Check Confidence Scores**: Focus on low-confidence results
- **Maintain Consistency**: Use consistent terminology
- **Regular Updates**: Keep schemas and patterns current

### Team Collaboration
- **Shared Understanding**: Ensure team alignment on process
- **Regular Reviews**: Schedule periodic quality assessments
- **Feedback Loops**: Continuously improve extraction quality
- **Knowledge Sharing**: Document lessons learned

## 🔍 Troubleshooting

### Common Issues

#### Upload Problems
- **File Size Limits**: Check individual and total file size restrictions
- **Format Support**: Verify file type is supported
- **Network Issues**: Check internet connection and try again
- **Browser Compatibility**: Ensure modern browser with JavaScript enabled

#### Processing Failures
- **API Limits**: Check Google Cloud API quotas
- **File Corruption**: Verify file integrity and try re-uploading
- **Schema Issues**: Review construct definition for errors
- **Resource Constraints**: Check Cloud Run resource limits

#### AI Assistant Issues
- **API Key Configuration**: Verify Gemini API key is set
- **Network Connectivity**: Check API endpoint accessibility
- **Rate Limiting**: Respect API usage limits
- **Context Issues**: Ensure proper context is being passed

### Debug Steps
1. **Check Browser Console**: Look for JavaScript errors
2. **Review Network Tab**: Monitor API request/response
3. **Verify Environment**: Confirm configuration settings
4. **Check Logs**: Review Cloud Run application logs
5. **Test Endpoints**: Use tools like Postman to test APIs

## 📚 Additional Resources

### Documentation
- **API Reference**: Complete endpoint documentation
- **User Guide**: Step-by-step user instructions
- **Developer Guide**: Technical implementation details
- **Troubleshooting**: Common issues and solutions

### Support
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides and tutorials
- **Community**: User forums and discussion groups
- **Professional Services**: Custom implementation support

### Training
- **Video Tutorials**: Step-by-step walkthroughs
- **Interactive Demos**: Hands-on learning experiences
- **Best Practices**: Industry-standard methodologies
- **Case Studies**: Real-world implementation examples

## 🤝 Contributing

### Development Guidelines
- **Code Standards**: Follow project coding conventions
- **Testing**: Include unit and integration tests
- **Documentation**: Update docs for new features
- **Code Review**: Submit pull requests for review

### Areas for Contribution
- **UI/UX Improvements**: Better user experience design
- **AI Enhancement**: Improved extraction algorithms
- **Performance Optimization**: Faster processing and response
- **Integration**: Additional tool and platform support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Cloud Platform** for hosting and AI services
- **Next.js Team** for the excellent React framework
- **FastAPI Community** for the high-performance Python framework
- **Open Source Contributors** for various dependencies and tools

---

*This README serves as the primary knowledge base for the AI assistant. It contains comprehensive information about the application's functionality, architecture, and user guidance that the AI can reference to provide accurate, helpful assistance to users.*
