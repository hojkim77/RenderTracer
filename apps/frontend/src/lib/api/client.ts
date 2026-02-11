import { AnalyzeRequest, AnalyzeResponse, AnalysisJob } from '@react-visual-rendering-tracer/shared-types';

const API_URL = process.env.NEXT_PUBLIC_WORKERS_API_URL || process.env.WORKERS_API_URL || 'http://localhost:8787';

export class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(getAuthToken: () => Promise<string | null>) {
    this.baseUrl = API_URL;
    this.getAuthToken = getAuthToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async analyzeRepository(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.request<AnalyzeResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAnalysisJob(jobId: string): Promise<AnalysisJob> {
    return this.request<AnalysisJob>(`/api/jobs/${jobId}`);
  }

  async getRepositories(): Promise<any[]> {
    return this.request<any[]>('/api/repositories');
  }
}

