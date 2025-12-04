"use client";

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { getJobStatus } from '../lib/api';

interface JobStatusProps {
  jobId: string | null;
  jobStatus: string;
  onStartProcessing: () => void;
  isProcessing: boolean;
}

const statusConfig = {
  CREATED: { label: 'Created', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export function JobStatus({ jobId, jobStatus, onStartProcessing, isProcessing }: JobStatusProps) {
  const [jobData, setJobData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || jobStatus === 'idle') return;

    if (jobStatus === 'PROCESSING') {
      setIsPolling(true);
      setError(null);
    } else {
      setIsPolling(false);
    }
  }, [jobId, jobStatus]);

  const handleRefresh = async () => {
    if (!jobId) return;
    
    setIsPolling(true);
    setError(null);
    try {
      const response = await getJobStatus(jobId);
      setJobData(response);
    } catch (err) {
      setError('Failed to refresh job status');
    } finally {
      setIsPolling(false);
    }
  };

  // Show start processing button when no job is running
  if (jobStatus === 'idle') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Ready to Process</span>
          </CardTitle>
          <CardDescription>
            Click the button below to start processing your interview transcripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onStartProcessing}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Start AI Processing
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show job status when processing
  if (jobStatus === 'PROCESSING') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Processing Interview Transcripts</span>
          </CardTitle>
          <CardDescription>
            AI is analyzing your transcripts and extracting user stories. This may take a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={60} className="w-full" />
            <div className="text-center">
              <p className="text-sm text-gray-600">Extracting insights from your transcripts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show completion status
  if (jobStatus === 'COMPLETED') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Processing Complete!</span>
          </CardTitle>
          <CardDescription>
            Your interview transcripts have been successfully processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Processing Complete</p>
            <p className="text-gray-600">You can now review and edit your user stories.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error status
  if (jobStatus === 'FAILED') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Processing Failed</span>
          </CardTitle>
          <CardDescription>
            There was an error processing your transcripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Processing Failed</p>
            <p className="text-gray-600 mb-4">Please try again or contact support if the issue persists.</p>
            <Button onClick={onStartProcessing} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
