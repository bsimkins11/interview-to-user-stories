// API Configuration
// Set NEXT_PUBLIC_API_URL in .env.local for local dev or Vercel env vars for production
// Default to the actual GCP Cloud Run URL (updated after GCP config changes)
// IMPORTANT: If using Vercel, make sure NEXT_PUBLIC_API_URL is set to the correct URL
// Correct URL: https://interview-etl-backend-bwxhuzcaka-uc.a.run.app
// OLD URL (DO NOT USE): https://interview-etl-backend-245695174310.us-central1.run.app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://interview-etl-backend-bwxhuzcaka-uc.a.run.app';

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🔗 Backend API URL:', API_BASE_URL);
}

// API Client with retry logic and error handling
class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.request<{ status: string; timestamp: string }>('/health');
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create construct
  async createConstruct(construct: any): Promise<{ id: string; message: string }> {
    try {
      return await this.request<{ id: string; message: string }>('/constructs', {
        method: 'POST',
        body: JSON.stringify(construct),
      });
    } catch (error) {
      throw new Error(`Failed to create construct: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create job
  async createJob(jobData: any): Promise<{ id: string; status: string; message: string; created_at: string }> {
    try {
      return await this.request<{ id: string; status: string; message: string; created_at: string }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
    } catch (error) {
      throw new Error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<any> {
    try {
      return await this.request<any>(`/jobs/${jobId}`);
    } catch (error) {
      throw new Error(`Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Download results
  async downloadResults(jobId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}/jobs/${jobId}/download`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(`Failed to download results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// File upload functions
export async function uploadFiles(files: File[]): Promise<any[]> {
  try {
    // The deployed backend expects 'files' (plural) and accepts multiple files
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    console.log(`Uploading ${files.length} file(s) to ${API_BASE_URL}/upload`);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
      credentials: 'omit', // Don't send cookies
    });
    
    console.log(`Upload response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log(`Upload response:`, JSON.stringify(result, null, 2));
    
    // The deployed backend returns: {success: true, files: [{id, original_name, ...}]}
    // Map to expected format: [{id, name, ...}]
    if (result.success && result.files && Array.isArray(result.files)) {
      const mappedFiles = result.files.map((f: any) => {
        // Backend returns 'original_name' but we need 'name' for the UI
        const fileName = f.name || f.original_name || 'unknown';
        console.log(`Mapping file: ${fileName} (id: ${f.id})`);
        return {
          id: f.id,
          name: fileName,
          size: f.size || 0,
          type: f.type || 'unknown',
          message: "File uploaded successfully"
        };
      });
      console.log(`Mapped files:`, mappedFiles);
      return mappedFiles;
    }
    
    // Fallback: if response format is different, try to extract files
    if (Array.isArray(result)) {
      console.log('Response is array, returning as-is');
      return result;
    }
    
    // If single file response (old format)
    console.log('Single file response, wrapping in array');
    return [result];
    
  } catch (error) {
    console.error(`Upload error:`, error);
    
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - possible CORS or connection issue');
      return files.map(file => ({
        error: `Network error: Unable to connect to backend. Please check your connection and try again.`,
        name: file.name
      }));
    }
    
    // Return error for all files
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    console.error(`Upload failed with error: ${errorMessage}`);
    return files.map(file => ({
      error: errorMessage,
      name: file.name
    }));
  }
}

// Export API client instance
export const apiClient = new APIClient(API_BASE_URL);

// Export individual functions for backward compatibility
export const createConstruct = (construct: any) => apiClient.createConstruct(construct);
export const createJob = (jobData: any) => apiClient.createJob(jobData);
export const getJobStatus = (jobId: string) => apiClient.getJobStatus(jobId);
export const downloadResults = (jobId: string) => apiClient.downloadResults(jobId);
export const healthCheck = () => apiClient.healthCheck();
