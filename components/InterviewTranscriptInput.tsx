"use client";

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadFiles } from '@/lib/api';

interface TranscriptInput {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  backendFileId?: string;
}

interface InterviewTranscriptInputProps {
  onTranscriptsAdded: (transcripts: TranscriptInput[]) => void;
  onTranscriptsRemoved: (transcriptIds: string[]) => void;
  existingTranscripts: TranscriptInput[];
}

export function InterviewTranscriptInput({ 
  onTranscriptsAdded, 
  onTranscriptsRemoved, 
  existingTranscripts 
}: InterviewTranscriptInputProps) {
  const [transcripts, setTranscripts] = useState<TranscriptInput[]>(existingTranscripts);
  const { toast } = useToast();

  // Generate unique ID
  const generateId = () => `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // File dropzone
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          toast({
            title: "File rejected",
            description: `${file.name}: ${error.message}`,
            variant: "destructive",
          });
        });
      });
    }

    if (acceptedFiles.length > 0) {
      const newTranscripts: TranscriptInput[] = acceptedFiles.map(file => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const,
      }));

      setTranscripts(prev => [...prev, ...newTranscripts]);

      // Upload files to backend
      uploadFiles(acceptedFiles).then(result => {
        console.log('Upload results:', result);
        
        // Check for errors
        const errors = result.filter(r => r.error);
        if (errors.length > 0) {
          const errorMessages = errors.map(e => `${e.name}: ${e.error}`).join(', ');
          console.error('Upload errors detected:', errors);
          toast({
            title: "Upload failed",
            description: errorMessages || "Some files failed to upload. Please try again.",
            variant: "destructive",
          });
        }
        
        // Update transcripts with backend file IDs
        setTranscripts(prev => {
          return prev.map(t => {
            // Match by filename - backend returns 'name' after our mapping
            const uploadResult = result.find(r => {
              const resultName = r.name || r.original_name;
              return resultName === t.name;
            });
            
            console.log(`Matching transcript ${t.name} with upload result:`, uploadResult);
            
            if (uploadResult && !uploadResult.error && uploadResult.id) {
              console.log(`✅ Upload successful for ${t.name}, ID: ${uploadResult.id}`);
              return { ...t, status: 'completed' as const, backendFileId: uploadResult.id };
            } else {
              const errorMsg = uploadResult?.error || 'Upload failed - no matching result';
              console.error(`❌ Upload failed for ${t.name}:`, errorMsg, 'Available results:', result);
              return { ...t, status: 'error' as const };
            }
          });
        });

        // Notify parent component only for successful uploads
        const successful = newTranscripts.filter(nt => {
          const uploadResult = result.find(ur => ur.name === nt.name);
          return uploadResult && !uploadResult.error && uploadResult.id;
        });
        
        if (successful.length > 0) {
          // Update successful transcripts with backend IDs
          const successfulWithIds = successful.map(nt => {
            const uploadResult = result.find(ur => ur.name === nt.name);
            return { ...nt, backendFileId: uploadResult?.id };
          });
          onTranscriptsAdded(successfulWithIds);
        }
      }).catch(error => {
        console.error('Upload promise rejection:', error);
        // Update all transcripts to error state
        setTranscripts(prev => prev.map(t => 
          newTranscripts.some(nt => nt.id === t.id) 
            ? { ...t, status: 'error' as const }
            : t
        ));
        toast({
          title: "Upload failed",
          description: error?.message || "Failed to upload files. Please check the browser console for details.",
          variant: "destructive",
        });
        
        // Mark transcripts as failed
        setTranscripts(prev => prev.map(t => 
          newTranscripts.some(nt => nt.id === t.id) 
            ? { ...t, status: 'error' as const }
            : t
        ));
      });
    }
  }, [onTranscriptsAdded, toast]);

  const onDropAccepted = useCallback((files: File[]) => {
    // Files are handled in onDrop
  }, []);

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        toast({
          title: "File rejected",
          description: `${file.name}: ${error.message}`,
          variant: "destructive",
        });
      });
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected,
    onError: (error) => {
      console.error('Dropzone error:', error);
      toast({
        title: "Upload error",
        description: "An error occurred during file upload. Please try again.",
        variant: "destructive",
      });
    },
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeTranscript = (id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
    onTranscriptsRemoved([id]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'uploading':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Interview Transcripts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports TXT, PDF, DOCX, CSV, and MD files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {transcripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Uploaded Files ({transcripts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transcript.status)}
                    <div>
                      <p className="font-medium text-gray-900">{transcript.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(transcript.size)} • {transcript.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(transcript.status)}>
                      {transcript.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTranscript(transcript.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
