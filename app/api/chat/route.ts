import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with backend API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Knowledge base context for the Interview ETL application
const KNOWLEDGE_BASE = `
Interview ETL is an intelligent application that transforms stakeholder interview transcripts into structured user stories and requirements using advanced AI processing. The system provides a guided, 5-step workflow that helps product managers, business analysts, and development teams extract actionable insights from qualitative interview data.

## 5-Step Workflow:

### Step 1: Define Output Structure (Construct)
- User creates a "construct" that defines output fields
- Fields can include: user story text, stakeholder info, epic, priority, confidence, tags
- Validation rules can be set for data quality
- Pattern matching can be configured for consistent extraction

### Step 2: Upload Interview Transcripts
- Users upload interview files (TXT, DOCX, PDF, MD, CSV, ZIP)
- System validates file formats and sizes
- Files are queued for AI processing
- Progress tracking shows upload status

### Step 3: AI Processing & Extraction
- AI analyzes uploaded transcripts using defined schema
- Natural language processing extracts key information
- User stories are generated with confidence scores
- Processing typically takes 2-5 minutes
- Real-time progress updates are provided

### Step 4: Edit & Refine User Stories
- Users can edit any field in generated user stories
- Inline editing with real-time updates
- Bulk operations for multiple stories
- Validation against defined schema
- Export capabilities for external tools

### Step 5: Generate Requirements
- Users define requirements structure (similar to step 1)
- System converts user stories to requirements
- Technical specifications are generated
- Requirements can be reviewed and edited
- Final outputs are exported as CSV files

## Key Capabilities:
- File Support: TXT, DOCX, PDF, Markdown, CSV, ZIP (up to 50MB individual, 500MB total)
- AI Processing: Gemini AI with Vertex AI vectorization (2-5 min processing time)
- Output Formats: CSV export for user stories and requirements
- Editing: Full inline editing of extracted data
- Validation: Confidence scoring and quality metrics

## Technical Architecture:
- Frontend: Next.js 14 with React 18 and TypeScript
- Backend: FastAPI with Python 3.11+
- AI: Google Gemini API + Vertex AI for embeddings
- Storage: Google Cloud Firestore + Cloud Storage
- Processing: Async worker with Pub/Sub integration

## Data Models:
- User Story: id, userStory, stakeholder info, epic, priority, confidence, tags
- Requirement: req_id, requirement, priority_level, req_details, source_story_id
- Construct: name, output_schema, pattern, validation_rules

## Best Practices:
- Use structured interview guides with clear stakeholder identification
- Keep output schemas focused but comprehensive
- Review AI extractions and validate confidence scores
- Process interviews in logical batches for better context
- Maintain consistent naming conventions across projects

## Common Questions & Answers:
- "How does it work?": 5-step workflow from schema definition to requirements generation
- "What file formats?": TXT, DOCX, PDF, Markdown, CSV, ZIP with size limits
- "How long does processing take?": 2-5 minutes depending on file count and size
- "Can I edit the results?": Yes, full inline editing of user stories and requirements
- "What makes this different?": AI-powered extraction with vectorization for context awareness
- "How do I get started?": Click Get Started → Define output structure → Upload transcripts

## User Story Best Practices (INVEST Criteria):
- Independent: Stories can be developed and tested independently
- Negotiable: Details can be discussed and refined
- Valuable: Stories deliver value to users or stakeholders
- Estimable: Stories can be sized and planned
- Small: Stories are manageable and can be completed in one sprint
- Testable: Stories have clear acceptance criteria

## File Upload Guidelines:
- Supported formats: TXT, DOCX, PDF, Markdown, CSV, ZIP
- Size limits: 50MB per file, 500MB total
- Prepare transcripts with clear speaker identification
- Organize files logically (e.g., by stakeholder or interview date)
- Ensure good audio quality for better transcription accuracy

## Processing Tips:
- Processing time varies with file count and size
- Review confidence scores for quality assessment
- High confidence scores indicate reliable extraction
- Low confidence may require manual review or schema adjustment
- Use tags and epics for better organization
`;

interface ChatContext {
  currentStep: string;
  construct?: any;
  userStories?: any[];
  requirements?: any[];
  transcripts?: any[];
  chatHistory?: Array<{type: 'user' | 'assistant', message: string, timestamp: Date}>;
}

interface ChatRequest {
  message: string;
  context: ChatContext;
}

function getFallbackResponse(userQuestion: string, context: ChatContext): string {
  const { currentStep, construct, userStories, requirements, transcripts } = context;
  const lowerQuestion = userQuestion.toLowerCase();
  
  // Step-specific responses with more comprehensive guidance
  switch (currentStep) {
    case 'home':
      if (lowerQuestion.includes('how') && lowerQuestion.includes('work')) {
        return "The Interview ETL works in 5 steps: 1) Define your output structure, 2) Upload interview transcripts, 3) AI processes your files, 4) Edit the generated user stories, 5) Convert to requirements. Click 'Get Started' to begin! This AI-powered tool transforms stakeholder interviews into structured, actionable insights.";
      }
      if (lowerQuestion.includes('start')) {
        return "Click the 'Get Started' button to begin! You'll first define your output structure (what fields you want in your user stories), then upload your interview transcripts. The AI will do the heavy lifting of extracting insights from your interviews.";
      }
      if (lowerQuestion.includes('what') && lowerQuestion.includes('different')) {
        return "Interview ETL is different because it uses advanced AI to automatically extract user stories from interview transcripts, provides a guided 5-step workflow, offers real-time editing capabilities, and generates both user stories and technical requirements. It's designed specifically for product managers and business analysts.";
      }
      return "Welcome to Interview ETL! This AI-powered tool transforms stakeholder interviews into structured user stories and requirements. It's perfect for product managers, business analysts, and development teams who need to extract actionable insights from qualitative interview data. Click 'Get Started' to begin your journey.";
      
    case 'construct':
      if (lowerQuestion.includes('schema') || lowerQuestion.includes('field')) {
        return "Your output schema defines what information will be extracted from interviews. Essential fields include: user story text, stakeholder details, epic/category, priority level, confidence score, and tags. You can add custom fields specific to your project needs. Think about what data points are most important for your user stories and requirements.";
      }
      if (lowerQuestion.includes('best practice')) {
        return "Best practices for schema design: Start with essential fields (user story, stakeholder, priority), use clear and unambiguous field names, include validation rules for data consistency, consider how the data will be used downstream, and plan for future growth. Keep schemas focused but comprehensive.";
      }
      if (lowerQuestion.includes('example') || lowerQuestion.includes('template')) {
        return "A good starting schema might include: userStory (text), stakeholder (text), epic (text), priority (low/medium/high/critical), confidence (number 0-100), tags (array), and source (text). You can customize this based on your specific project needs and add validation rules.";
      }
      return "You're defining your output structure! This determines what information will be extracted from your interview transcripts. Think about what data points are most important for your user stories, how you'll organize and categorize them, and what fields will help your team make better decisions.";
      
    case 'upload':
      if (lowerQuestion.includes('format') || lowerQuestion.includes('file')) {
        return "Supported formats: TXT, DOCX, PDF, Markdown, CSV, and ZIP files. Individual files up to 50MB, total upload up to 500MB. Drag & drop or click to browse files. For best results, ensure your transcripts have clear speaker identification and good quality text.";
      }
      if (lowerQuestion.includes('process') || lowerQuestion.includes('extract')) {
        return "Once you upload files, the AI will automatically process them and extract user stories based on your defined schema. This typically takes 2-5 minutes depending on file count and size. The AI uses natural language processing to identify patterns, stakeholders, and key information from your interviews.";
      }
      if (lowerQuestion.includes('prepare') || lowerQuestion.includes('organize')) {
        return "To prepare your transcripts: ensure clear speaker identification, organize files logically (e.g., by stakeholder or interview date), use consistent naming conventions, and verify file quality. Good preparation leads to better AI extraction results.";
      }
      return "Upload your interview transcripts here! Supported formats include TXT, DOCX, PDF, Markdown, and CSV. The AI will process these files to extract user stories based on your defined schema. You can upload multiple files at once for batch processing.";
      
    case 'process':
      if (lowerQuestion.includes('how long') || lowerQuestion.includes('time')) {
        return "AI processing typically takes 2-5 minutes depending on the number and size of your transcripts. You'll see a progress indicator during processing. The AI is analyzing text, identifying patterns, and extracting structured information according to your schema.";
      }
      if (lowerQuestion.includes('what happen') || lowerQuestion.includes('doing')) {
        return "The AI is analyzing your interview transcripts using natural language processing and your defined schema. It's extracting user stories, identifying stakeholders, categorizing information, and generating confidence scores. This involves pattern recognition, context understanding, and structured data generation.";
      }
      if (lowerQuestion.includes('confidence') || lowerQuestion.includes('score')) {
        return "Confidence scores indicate how reliable the AI extraction is. High scores (80-100) suggest reliable extraction, while lower scores may require manual review. You can always edit and refine the results after processing is complete.";
      }
      return "The AI is processing your uploaded files! This involves analyzing the text, extracting key information based on your schema, and generating structured user stories with confidence scores. You'll be able to review and edit all results once processing is complete.";
      
    case 'userStories':
      if (lowerQuestion.includes('edit') || lowerQuestion.includes('update')) {
        return "You can edit any field in your user stories by clicking on it. The AI has already extracted the information, but you can refine it to match your exact needs. Use inline editing for quick updates, and consider the INVEST criteria for story quality.";
      }
      if (lowerQuestion.includes('story') && lowerQuestion.includes('good')) {
        return "Good user stories follow the INVEST criteria: Independent (can be developed independently), Negotiable (details can be discussed), Valuable (delivers user value), Estimable (can be sized), Small (manageable in one sprint), and Testable (clear acceptance criteria). Focus on user value and clear acceptance criteria.";
      }
      if (lowerQuestion.includes('prioritize') || lowerQuestion.includes('organize')) {
        return "Organize your user stories by priority, epic, stakeholder, or tags. High-priority stories should address critical user needs, while lower-priority items can be addressed later. Use epics to group related stories and tags for cross-cutting concerns.";
      }
      return "Review and edit your AI-generated user stories here! You can modify any field, add details, or refine the content to match your project requirements. The AI has done the heavy lifting of extraction, now you can focus on refinement and organization.";
      
    case 'requirements_construct':
      if (lowerQuestion.includes('requirement') && lowerQuestion.includes('story')) {
        return "Requirements are derived from user stories. They provide technical specifications and implementation details that developers need to build the solution. Each requirement should trace back to one or more user stories, ensuring alignment between user needs and technical implementation.";
      }
      if (lowerQuestion.includes('structure')) {
        return "Define your requirements structure with fields like requirement ID, description, priority level, technical details, acceptance criteria, and traceability to source user stories. Consider including non-functional requirements like performance, security, and scalability needs.";
      }
      if (lowerQuestion.includes('best practice')) {
        return "Best practices for requirements: ensure traceability to user stories, include clear acceptance criteria, specify both functional and non-functional requirements, maintain consistent terminology, and review for completeness and clarity.";
      }
      return "Define your requirements structure here! This determines how user stories will be converted into detailed technical requirements. Think about what technical details developers need, how to maintain traceability, and what acceptance criteria will ensure successful delivery.";
      
    case 'requirements':
      if (lowerQuestion.includes('review') || lowerQuestion.includes('validate')) {
        return "Review your requirements for clarity, completeness, and traceability. Ensure each requirement is specific, measurable, and linked to user stories. Check that acceptance criteria are clear and that non-functional requirements are addressed. Validate that requirements can be implemented and tested.";
      }
      if (lowerQuestion.includes('download') || lowerQuestion.includes('export')) {
        return "You can download your requirements as CSV files. This makes it easy to import into project management tools like Jira, Azure DevOps, or other systems. The CSV format maintains all your data structure and can be easily shared with stakeholders or development teams.";
      }
      if (lowerQuestion.includes('quality') || lowerQuestion.includes('improve')) {
        return "To improve requirement quality: ensure clarity and specificity, include measurable acceptance criteria, maintain traceability to user stories, review for completeness, and validate that requirements are implementable and testable.";
      }
      return "Review your generated requirements here! These are technical specifications derived from your user stories, ready for development teams. You can edit, organize, and export them for use in your project management and development workflows.";
      
    default:
      return "I'm here to help you with the Interview ETL process! I can explain how the system works, provide guidance for each step, and help you get the most out of your interview data. Whether you're defining schemas, uploading files, processing transcripts, editing user stories, or generating requirements, I'm here to guide you through the entire workflow.";
  }
}

function createContextAwarePrompt(userQuestion: string, context: ChatContext): string {
  const { currentStep, construct, userStories, requirements, transcripts, chatHistory } = context;
  
  // Build context string
  let contextString = `Current Step: ${currentStep}\n`;
  
  if (construct) {
    contextString += `Construct: ${construct.name} with ${construct.output_schema?.length || 0} fields\n`;
  }
  
  if (userStories && userStories.length > 0) {
    contextString += `User Stories: ${userStories.length} stories available\n`;
  }
  
  if (requirements && requirements.length > 0) {
    contextString += `Requirements: ${requirements.length} requirements available\n`;
  }
  
  if (transcripts && transcripts.length > 0) {
    contextString += `Transcripts: ${transcripts.length} transcripts processed\n`;
  }
  
  // Build conversation context from recent chat history
  let conversationContext = '';
  if (chatHistory && chatHistory.length > 0) {
    const recentHistory = chatHistory.slice(-6); // Last 6 messages for context
    conversationContext = '\n\nRecent Conversation Context:\n';
    recentHistory.forEach(chat => {
      conversationContext += `${chat.type === 'user' ? 'User' : 'Assistant'}: ${chat.message}\n`;
    });
  }
  
  return `
You are an AI assistant for the Interview ETL application. Use the following knowledge base to provide helpful, context-aware assistance:

${KNOWLEDGE_BASE}

Current User Context:
${contextString}${conversationContext}

User Question: ${userQuestion}

Instructions:
1. Be helpful, specific, and context-aware
2. Reference the user's current step and data when possible
3. Provide actionable advice and clear explanations
4. Use the knowledge base to give accurate, detailed responses
5. If the user is asking about a specific step, provide guidance for that step
6. If they're asking about capabilities, explain what the app can do
7. Consider the conversation history for continuity and context
8. Always be encouraging and supportive
9. If the user is referencing previous questions or context, acknowledge that continuity

Please provide a helpful response based on the user's question and current context:
`;
}

export async function POST(request: NextRequest) {
  let message: string = '';
  let context: ChatContext = {
    currentStep: 'home',
    userStories: [],
    requirements: [],
    transcripts: [],
    chatHistory: []
  };
  
  try {
    const body: ChatRequest = await request.json();
    message = body.message;
    context = body.context;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API is configured
    if (!process.env.GEMINI_API_KEY || 
        process.env.GEMINI_API_KEY === 'your-actual-gemini-api-key-here' ||
        process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      
      // Return a helpful fallback response instead of an error
      const fallbackResponse = getFallbackResponse(message, context);
      return NextResponse.json({ 
        response: fallbackResponse,
        note: 'Using fallback response - Gemini API not configured'
      });
    }

    // Create context-aware prompt
    const prompt = createContextAwarePrompt(message, context);
    
    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Try to provide a fallback response even on errors
    try {
      if (message && context) {
        const fallbackResponse = getFallbackResponse(message, context);
        return NextResponse.json({ 
          response: fallbackResponse,
          note: 'Using fallback response due to API error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } catch (fallbackError) {
      console.error('Fallback response error:', fallbackError);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
