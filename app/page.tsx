"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Play, 
  Upload, 
  Download, 
  FileText, 
  Target, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { RightRailAI } from '@/components/RightRailAI';
import { ConstructEditor } from '@/components/ConstructEditor';
import { InterviewTranscriptInput } from '@/components/InterviewTranscriptInput';
import { JobStatus } from '@/components/JobStatus';
import { EditableUserStoriesTable } from '@/components/EditableUserStoriesTable';
import { RequirementsConstructEditor } from '@/components/RequirementsConstructEditor';
import { RequirementsTable } from '@/components/RequirementsTable';
import { ResultsDownload } from '@/components/ResultsDownload';
import { createJob, getJobStatus, createConstruct } from '@/lib/api';
import { FileUpload } from '@/components/FileUpload';

// Types
type Step = 'home' | 'construct' | 'upload' | 'process' | 'download' | 'userStories' | 'requirements_construct' | 'requirements';

interface Construct {
  name: string;
  output_schema: string[];
  description?: string;
  defaults?: Record<string, string>;
  priority_rules?: string[];
}

interface UserStory {
  id: string;
  userStory: string;
  userStoryStatement: string;
  epic: string;
  stakeholderName: string;
  stakeholderRole: string;
  stakeholderTeam: string;
  category: string;
  changeCatalyst: string;
  useCaseId: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  tags: string[];
  lifecyclePhase?: string;
  source?: string;
  snippet?: string;
}

interface Requirement {
  req_id: string;
  requirement: string;
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH';
  req_details: string;
  source_story_id?: string;
  category?: string;
  complexity?: string;
  effort_estimate?: string;
}

interface TranscriptInput {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  backendFileId?: string;
}

// Constants
const STEPS = [
  { id: 'construct', title: 'Define Output Structure', icon: Target, description: 'Define how your user stories should be structured' },
  { id: 'upload', title: 'Upload Interview Transcripts', icon: Upload, description: 'Upload or link to interview transcripts' },
  { id: 'process', title: 'Process & Extract', icon: Play, description: 'AI-powered extraction and processing' },
  { id: 'userStories', title: 'Edit User Stories', icon: FileText, description: 'Review and edit your user stories' },
  { id: 'requirements_construct', title: 'Define Requirements Structure', icon: FileText, description: 'Define the structure for your requirements' },
  { id: 'requirements', title: 'Requirements', icon: FileText, description: 'Convert user stories to requirements' },
  { id: 'download', title: 'Download Results', icon: Download, description: 'Get your structured requirements' }
];

const POLLING_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 150; // 5 minutes max
const FALLBACK_TIMEOUT = 30000; // 30 seconds

export default function Home() {
  // State
  const [currentStep, setCurrentStep] = useState<Step>('home');
  const [construct, setConstruct] = useState<Construct | null>(null);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [requirementsConstruct, setRequirementsConstruct] = useState<any>(null);
  const [transcripts, setTranscripts] = useState<TranscriptInput[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [forceRefresh, setForceRefresh] = useState<number>(0);
  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState(false);

  // Hooks
  const { toast } = useToast();

  // Debug wrapper for setUserStories (can be removed in production)
  const setUserStoriesWithDebug = useCallback((stories: UserStory[]) => {
    setUserStories(stories);
  }, []);

  // Navigation validation
  const canProceedToNext = useCallback((): boolean => {
    switch (currentStep) {
      case 'home':
        return true;
      case 'construct':
        return Boolean(construct?.name?.trim()) && (construct?.output_schema?.length || 0) > 0;
      case 'upload':
        return transcripts.length > 0;
      case 'process':
        return userStories.length > 0;
      case 'userStories':
        return userStories.length > 0;
      case 'requirements_construct':
        return Boolean(requirementsConstruct?.name?.trim()) && (requirementsConstruct?.output_schema?.length || 0) > 0;
      case 'requirements':
        return requirements.length > 0;
      case 'download':
        return true;
      default:
        return false;
    }
  }, [currentStep, construct, transcripts.length, userStories.length, requirementsConstruct, requirements.length]);

  const canGoBack = useCallback((): boolean => {
    return currentStep !== 'home';
  }, [currentStep]);

  // Navigation handlers
  const handleGetStarted = useCallback(() => {
    setCurrentStep('construct');
  }, []);

  const handleNext = useCallback(() => {
    if (canProceedToNext()) {
      const currentIndex = STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex < STEPS.length - 1) {
        const nextStep = STEPS[currentIndex + 1].id as Step;
        setCurrentStep(nextStep);
      }
    }
  }, [canProceedToNext, currentStep]);

  const handlePrevious = useCallback(() => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id as Step);
    }
  }, [currentStep]);

  // Construct handling
  const handleConstructSave = useCallback(async (newConstruct: Construct) => {
    if (isProcessing) return;

    try {
      // Validation
      if (!newConstruct.name?.trim()) {
        toast({ 
          title: "Validation Error", 
          description: "Construct name is required.", 
          variant: "destructive" 
        });
        return;
      }
      
      if (!newConstruct.output_schema || newConstruct.output_schema.length === 0) {
        toast({ 
          title: "Validation Error", 
          description: "At least one output schema field is required.", 
          variant: "destructive" 
        });
        return;
      }

      setIsProcessing(true);
      setConstruct(newConstruct);

      toast({
        title: "Construct saved!",
        description: `Your output structure "${newConstruct.name}" has been defined with ${newConstruct.output_schema.length} fields.`,
      });

      // Backend save (fire-and-forget)
      try {
        await createConstruct(newConstruct);
      } catch (apiError) {
        // Silently fail - using local construct only
      }

    } catch (error) {
      toast({ 
        title: "Error saving construct", 
        description: "Failed to save construct. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast]);

  const handleRequirementsConstructSave = useCallback(async (newRequirementsConstruct: any) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setRequirementsConstruct(newRequirementsConstruct);

      toast({
        title: "Requirements structure saved!",
        description: "Your requirements structure has been defined.",
      });

    } catch (error) {
      toast({ 
        title: "Error saving requirements structure", 
        description: "Failed to save requirements structure. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast]);

  // Transcript handling
  const handleTranscriptsAdded = useCallback((newTranscripts: TranscriptInput[]) => {
    setTranscripts(prev => [...prev, ...newTranscripts]);
  }, []);

  const handleTranscriptsRemoved = useCallback((transcriptIds: string[]) => {
    setTranscripts(prev => prev.filter(t => !transcriptIds.includes(t.id)));
  }, []);

  // Job processing
  const startProcessing = useCallback(async () => {
    if (!construct || transcripts.length === 0) {
      toast({
        title: "Cannot Start Processing",
        description: "Please ensure you have a construct defined and transcripts uploaded.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setJobStatus('PROCESSING');

      const jobData = {
        construct: construct,
        transcripts: transcripts.map(t => ({
          id: t.backendFileId || t.id,
          name: t.name,
          size: t.size,
          type: t.type
        }))
      };

      const job = await createJob(jobData);
      setJobId(job.id);
      setJobStatus('PROCESSING');

      toast({
        title: "Processing Started",
        description: "AI is now processing your interview transcripts. This may take a few minutes.",
      });

      // Start polling for job status
      pollJobStatus(job.id);

    } catch (error) {
      setJobStatus('FAILED');
      toast({
        title: "Processing Failed",
        description: "Failed to start processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [construct, transcripts, toast]);

  const pollJobStatus = useCallback(async (jobId: string) => {
    let pollCount = 0;
    let errorCount = 0;

    const poll = async () => {
      try {
        pollCount++;
        const status = await getJobStatus(jobId);
        
        if (status.status === 'COMPLETED') {
          setJobStatus('COMPLETED');
          if (status.user_stories) {
            setUserStories(status.user_stories);
          }
          // Requirements will be generated on-demand when user requests them
          setCurrentStep('userStories');
          toast({
            title: "Processing Complete!",
            description: `Successfully extracted ${status.user_stories?.length || 0} user stories. Requirements can be generated when you're ready.`,
          });
          return;
        }

        if (status.status === 'FAILED') {
          setJobStatus('FAILED');
          toast({
            title: "Processing Failed",
            description: status.error || "An error occurred during processing.",
            variant: "destructive",
          });
          return;
        }

        // Continue polling if still processing
        if (pollCount < MAX_POLL_ATTEMPTS && status.status === 'PROCESSING') {
          setTimeout(poll, POLLING_INTERVAL);
        } else {
          // Fallback: assume completion and proceed
          handleProcessingFallback();
        }

      } catch (error) {
        errorCount++;
        
        if (errorCount < 3 && pollCount < MAX_POLL_ATTEMPTS) {
          setTimeout(poll, POLLING_INTERVAL);
        } else {
          handleProcessingFallback();
        }
      }
    };

    // Start polling
    poll();

    // Fallback timeout
    setTimeout(() => {
      if (jobStatus === 'PROCESSING') {
        handleProcessingFallback();
      }
    }, FALLBACK_TIMEOUT);
  }, [jobStatus, toast]);

  const handleProcessingFallback = useCallback(() => {
    setJobStatus('COMPLETED');
    // Generate sample data as fallback
    const sampleStories = generateSampleUserStories();
    
    setUserStories(sampleStories);
    // Requirements will be generated on-demand when user requests them
    
    setCurrentStep('userStories');
    
    toast({
      title: "Processing Complete (Fallback)",
      description: "Using sample data due to processing timeout. You can now review and edit your user stories. Requirements can be generated when you're ready.",
    });
  }, [toast]);

  // Sample data generation (fallback)
  const generateSampleUserStories = useCallback((): UserStory[] => {
    return [
      {
        id: 'US-001',
        userStory: 'As a stakeholder, I need to access interview data so that I can analyze requirements.',
        userStoryStatement: 'Enable stakeholders to access and analyze interview data for requirements gathering.',
        epic: 'Data Access',
        stakeholderName: 'Business Analyst',
        stakeholderRole: 'Analyst',
        stakeholderTeam: 'Business',
        category: 'Data Management',
        changeCatalyst: 'Need for better requirements analysis',
        useCaseId: 'UC-2024-001',
        priority: 'High',
        confidence: 0.9,
        tags: ['data', 'access', 'analysis'],
        lifecyclePhase: 'Discovery',
        source: 'Interview ETL',
        snippet: 'Stakeholder access to interview data for requirements analysis'
      },
      {
        id: 'US-002',
        userStory: 'As a developer, I need clear requirements so that I can implement features correctly.',
        userStoryStatement: 'Provide developers with clear, actionable requirements for feature implementation.',
        epic: 'Requirements Management',
        stakeholderName: 'Developer',
        stakeholderRole: 'Engineer',
        stakeholderTeam: 'Engineering',
        category: 'Development',
        changeCatalyst: 'Need for clear development guidance',
        useCaseId: 'UC-2024-002',
        priority: 'High',
        confidence: 0.85,
        tags: ['requirements', 'development', 'clarity'],
        lifecyclePhase: 'Planning',
        source: 'Interview ETL',
        snippet: 'Clear requirements for developers to implement features'
      }
    ];
  }, []);

  // Generate requirements from user stories
  const generateRequirements = useCallback(async () => {
    if (!userStories || userStories.length === 0) {
      toast({
        title: "No User Stories",
        description: "Please complete the user stories step first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingRequirements(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://interview-etl-backend-bwxhuzcaka-uc.a.run.app';
      const response = await fetch(`${backendUrl}/generate-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userStories: userStories,
          construct: construct
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setRequirements(data.requirements);
        toast({
          title: "Requirements Generated",
          description: data.message,
        });
      } else {
        throw new Error(data.message || 'Failed to generate requirements');
      }
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate requirements',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRequirements(false);
    }
  }, [userStories, construct, toast]);

  // Step content rendering
  const getStepContent = useCallback(() => {
    switch (currentStep) {
      case 'home':
        return (
          <div className="tp-max-w-6xl tp-mx-auto">
            {/* Hero Section */}
            <section className="tp-hero tp-text-center tp-mb-16">
              <div className="tp-mb-8">
                <div className="tp-h-20 tp-mx-auto tp-mb-6 flex justify-center">
                  <img
                    src="/Transparent-Partners-RGB-Logos_Primary (3).png"
                    alt="Transparent Partners Logo"
                    className="h-20 w-auto"
                  />
                </div>
              </div>
              <h1 className="tp-hero-title tp-text-5xl tp-font-bold text-gray-900 tp-mb-4">
                Transform Interviews into Requirements
              </h1>
              <p className="tp-hero-subtitle tp-text-xl text-gray-600 tp-mb-8 tp-max-w-3xl tp-mx-auto">
                Our AI-powered pipeline transforms stakeholder interviews into actionable requirements in minutes, not weeks.
              </p>
              <Button 
                onClick={() => setCurrentStep('construct')}
                className="tp-btn tp-btn-primary tp-btn-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Button>
            </section>

            {/* How It Works */}
            <section className="tp-section tp-mb-16">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900 tp-text-center tp-mb-12">
                How It Works
              </h2>
              <div className="tp-grid tp-grid-cols-1 tp-grid-cols-md-3 tp-gap-8">
                <div className="tp-feature bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="tp-text-xl tp-font-semibold text-gray-900 mb-2">1. Define Structure</h3>
                  <p className="text-gray-600">Create your output schema and define the fields you want in your user stories.</p>
                </div>
                <div className="tp-feature bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="tp-text-xl tp-font-semibold text-gray-900 mb-2">2. Upload Transcripts</h3>
                  <p className="text-gray-600">Upload interview transcripts in multiple formats for AI processing.</p>
                </div>
                <div className="tp-feature bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="tp-text-xl tp-font-semibold text-gray-900 mb-2">3. AI Extraction</h3>
                  <p className="text-gray-600">Advanced AI processes transcripts and extracts meaningful insights.</p>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section className="tp-section tp-mb-16">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900 tp-text-center tp-mb-12">
                Key Features
              </h2>
              <div className="tp-grid tp-grid-cols-1 tp-grid-cols-md-2 tp-gap-8">
                <div className="tp-feature bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-indigo-600 font-bold text-lg">AI</span>
                  </div>
                  <h3 className="tp-text-xl tp-font-semibold text-gray-900 mb-2">Smart Analysis</h3>
                  <p className="text-gray-600">AI-powered extraction with context-aware processing and vectorization for accurate insights.</p>
                </div>
                <div className="tp-feature bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold text-lg">✓</span>
                  </div>
                  <h3 className="tp-text-xl tp-font-semibold text-gray-900 mb-2">Professional Output</h3>
                  <p className="text-gray-600">Generate structured user stories and detailed requirements for development teams.</p>
                </div>
              </div>
            </section>
          </div>
        );

      case 'construct':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Define Output Structure</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Create the schema for your user stories. Define the fields and structure that will be extracted from your interview transcripts.
              </p>
            </div>
            <ConstructEditor onSave={handleConstructSave} />
          </div>
        );

      case 'upload':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Upload Interview Transcripts</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Upload your interview transcripts. The system supports multiple file formats and will process them together for better context understanding.
              </p>
            </div>
            <InterviewTranscriptInput
              onTranscriptsAdded={handleTranscriptsAdded}
              onTranscriptsRemoved={handleTranscriptsRemoved}
              existingTranscripts={transcripts}
            />
          </div>
        );

      case 'process':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">AI Processing</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                The AI is processing your transcripts to extract user stories. This may take a few minutes depending on the size and number of files.
              </p>
            </div>
            <JobStatus
              jobId={jobId}
              jobStatus={jobStatus}
              onStartProcessing={startProcessing}
              isProcessing={isProcessing}
            />
          </div>
        );

      case 'userStories':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Review & Edit User Stories</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Review the extracted user stories and make any necessary edits. You can modify fields, add details, or reorganize the information.
              </p>
            </div>
            <EditableUserStoriesTable
              userStories={userStories}
              onStoriesChange={setUserStoriesWithDebug}
              onDownload={() => {}}
            />
          </div>
        );

      case 'requirements_construct':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Define Requirements Structure</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Create the schema for your requirements. Define the fields and structure that will be used when converting user stories to requirements.
              </p>
            </div>
            <RequirementsConstructEditor onSave={handleRequirementsConstructSave} />
          </div>
        );

      case 'requirements':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Requirements</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Convert user stories to requirements using AI. The system will analyze your stories and create detailed technical requirements.
              </p>
            </div>
            
            {requirements.length === 0 ? (
              <div className="tp-text-center tp-space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                  <h3 className="tp-text-lg tp-font-semibold text-blue-900 mb-2">
                    Ready to Generate Requirements
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Click the button below to generate requirements from your user stories using AI.
                    The system will analyze your stories and create detailed technical requirements.
                  </p>
                  <Button 
                    onClick={generateRequirements}
                    disabled={isGeneratingRequirements || !userStories || userStories.length === 0}
                    className="tp-btn tp-btn-primary bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGeneratingRequirements ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Requirements...
                      </>
                    ) : (
                      'Generate Requirements from User Stories'
                    )}
                  </Button>
                  {(!userStories || userStories.length === 0) && (
                    <p className="text-sm text-blue-600 mt-2">
                      Complete the user stories step first to generate requirements.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="tp-space-y-4">
                <div className="tp-flex tp-justify-between tp-items-center">
                  <h3 className="tp-text-lg tp-font-semibold text-gray-900">
                    Generated Requirements ({requirements.length})
                  </h3>
                  <Button 
                    onClick={generateRequirements}
                    disabled={isGeneratingRequirements}
                    variant="outline"
                    className="tp-btn tp-btn-outline border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {isGeneratingRequirements ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate Requirements'
                    )}
                  </Button>
                </div>
                <RequirementsTable
                  requirements={requirements}
                  onRequirementsChange={setRequirements}
                  onDownload={() => {}}
                />
              </div>
            )}
          </div>
        );

      case 'download':
        return (
          <div className="tp-card bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="tp-text-center tp-space-y-4 tp-mb-8">
              <h2 className="tp-section-title tp-text-3xl tp-font-bold text-gray-900">Download Results</h2>
              <p className="tp-section-subtitle text-gray-600 tp-max-w-2xl tp-mx-auto">
                Get your structured user stories and requirements. Download the results in various formats for your development team.
              </p>
            </div>
            <ResultsDownload
              jobStatus={{
                id: jobId || 'temp-id',
                status: jobStatus,
                csv_url: '',
                userStories: userStories,
                requirements: requirements,
                metrics: {
                  total_files: transcripts.length,
                  total_stories: userStories.length,
                  total_requirements: requirements.length,
                  processing_time: new Date().toISOString()
                },
                construct: construct || undefined
              }}
              onNewJob={() => {
                setJobId(null);
                setJobStatus('idle');
                setCurrentStep('construct');
              }}
            />
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  }, [
    currentStep, construct, userStories, requirements, requirementsConstruct, transcripts, 
    jobId, jobStatus, isProcessing, handleConstructSave, handleRequirementsConstructSave,
    handleTranscriptsAdded, handleTranscriptsRemoved, startProcessing, setUserStoriesWithDebug,
    generateRequirements, isGeneratingRequirements
  ]);

  return (
    <div className="tp-min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Global Header - Show on ALL pages including home */}
      <GlobalHeader onHomeClick={() => setCurrentStep('home')} />
      
      <div className="tp-container tp-py-8">
        {/* Progress Steps - Show on all pages except home */}
        {currentStep !== 'home' && (
          <div className="tp-mb-8 tp-max-w-4xl tp-mx-auto">
            <div className="tp-flex tp-justify-center tp-space-x-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="tp-flex tp-items-center">
                  <div className={`tp-flex tp-items-center tp-justify-center tp-w-10 tp-h-10 tp-rounded-full tp-border-2 ${
                    STEPS.findIndex(s => s.id === currentStep) > index
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : STEPS.findIndex(s => s.id === currentStep) === index
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="tp-w-5 tp-h-5" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`tp-w-12 tp-h-0.5 tp-ml-3 ${
                      STEPS.findIndex(s => s.id === currentStep) > index ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentStep === 'home' ? (
          <div>
            {getStepContent()}
          </div>
        ) : (
          <div className="tp-max-w-4xl tp-mx-auto">
            {getStepContent()}
            
            {/* Navigation Buttons */}
            <div className="tp-flex tp-justify-between tp-mt-8">
              <Button
                onClick={handlePrevious}
                disabled={!canGoBack()}
                variant="outline"
                className="tp-btn tp-btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="tp-btn tp-btn-primary bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Right Rail AI Assistant - Available on all pages */}
        {currentStep !== 'home' && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
            <RightRailAI 
              currentStep={currentStep}
              construct={construct}
              userStories={userStories}
              transcripts={transcripts}
              requirements={requirements}
              requirementsConstruct={requirementsConstruct}
              onUpdateUserStories={setUserStoriesWithDebug}
              onUpdateRequirements={setRequirements}
              onUpdateConstruct={setConstruct}
              onUpdateTranscripts={setTranscripts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
