import type { SupabaseClient } from '@supabase/supabase-js';
import { AnalysisJob, AnalysisStatus } from '@react-visual-rendering-tracer/shared-types';

export async function createAnalysisJob(
  supabase: SupabaseClient,
  data: {
    userId: string;
    repositoryUrl: string;
    branch?: string;
    commitHash?: string;
  }
): Promise<AnalysisJob> {
  const { data: job, error } = await supabase
    .from('analysis_jobs')
    .insert({
      user_id: data.userId,
      repository_url: data.repositoryUrl,
      branch: data.branch || null,
      commit_hash: data.commitHash || null,
      status: 'pending',
      progress: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create analysis job: ${error.message}`);
  }

  return {
    id: job.id,
    userId: job.user_id,
    repositoryUrl: job.repository_url,
    branch: job.branch || undefined,
    commitHash: job.commit_hash || undefined,
    status: job.status as AnalysisStatus,
    progress: job.progress || undefined,
    error: job.error || undefined,
    createdAt: job.created_at,
    completedAt: job.completed_at || undefined,
    graphDataId: job.graph_data_id || undefined,
  };
}

export async function getAnalysisJob(
  supabase: SupabaseClient,
  jobId: string,
  userId: string
): Promise<AnalysisJob | null> {
  const { data: job, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get analysis job: ${error.message}`);
  }

  return {
    id: job.id,
    userId: job.user_id,
    repositoryUrl: job.repository_url,
    branch: job.branch || undefined,
    commitHash: job.commit_hash || undefined,
    status: job.status as AnalysisStatus,
    progress: job.progress || undefined,
    error: job.error || undefined,
    createdAt: job.created_at,
    completedAt: job.completed_at || undefined,
    graphDataId: job.graph_data_id || undefined,
  };
}

export async function updateJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: AnalysisStatus,
  progress?: number,
  error?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
  };

  if (progress !== undefined) {
    updateData.progress = progress;
  }

  if (error !== undefined) {
    updateData.error = error;
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('analysis_jobs')
    .update(updateData)
    .eq('id', jobId);

  if (updateError) {
    throw new Error(`Failed to update job status: ${updateError.message}`);
  }
}

export async function saveGraphData(
  supabase: SupabaseClient,
  jobId: string,
  graphData: unknown
): Promise<string> {
  // Graph 데이터 저장
  const { data: graphDataRecord, error: graphError } = await supabase
    .from('graph_data')
    .insert({
      job_id: jobId,
      data: graphData,
    })
    .select()
    .single();

  if (graphError) {
    throw new Error(`Failed to save graph data: ${graphError.message}`);
  }

  // Job에 graph_data_id 업데이트
  const { error: updateError } = await supabase
    .from('analysis_jobs')
    .update({ graph_data_id: graphDataRecord.id })
    .eq('id', jobId);

  if (updateError) {
    throw new Error(`Failed to update job with graph data ID: ${updateError.message}`);
  }

  return graphDataRecord.id;
}

