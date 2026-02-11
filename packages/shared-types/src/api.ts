/**
 * API 요청/응답 타입 정의
 */

// 분석 요청
export interface AnalyzeRequest {
  repositoryUrl: string;
  branch?: string;
  commitHash?: string;
}

// 분석 작업 상태
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisJob {
  id: string;
  userId: string;
  repositoryUrl: string;
  branch?: string;
  commitHash?: string;
  status: AnalysisStatus;
  progress?: number;  // 0-100
  error?: string;
  createdAt: string;
  completedAt?: string;
  graphDataId?: string;  // 완료 시 GraphData 참조
}

// 분석 결과 응답
export interface AnalyzeResponse {
  jobId: string;
  status: AnalysisStatus;
  graphData?: import('./graph').GraphData;
  error?: string;
}

// 사용자 레포지토리 목록
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
  defaultBranch: string;
}

// 인증 관련
export interface AuthUser {
  id: string;
  email?: string;
  githubUsername?: string;
  githubToken?: string;  // 암호화 저장
}

