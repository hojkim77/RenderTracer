import { createClient } from '@supabase/supabase-js';
import { AnalysisJob, AnalysisStatus } from '@react-visual-rendering-tracer/shared-types';

// Supabase 클라이언트는 환경 변수에서 가져옴
// 실제 구현 시 Workers의 환경 변수 사용

export async function createAnalysisJob(data: {
  userId: string;
  repositoryUrl: string;
  branch?: string;
  commitHash?: string;
}): Promise<AnalysisJob> {
  // TODO: Supabase에 작업 생성
  // 실제 구현 필요
  const job: AnalysisJob = {
    id: crypto.randomUUID(),
    userId: data.userId,
    repositoryUrl: data.repositoryUrl,
    branch: data.branch,
    commitHash: data.commitHash,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  return job;
}

export async function getAnalysisJob(jobId: string, userId: string): Promise<AnalysisJob | null> {
  // TODO: Supabase에서 작업 조회
  // 실제 구현 필요
  return null;
}

export async function updateJobStatus(
  jobId: string,
  status: AnalysisStatus,
  progress?: number,
  error?: string
): Promise<void> {
  // TODO: Supabase에서 작업 상태 업데이트
  // 실제 구현 필요
}

