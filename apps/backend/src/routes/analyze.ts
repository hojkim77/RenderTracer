import { Hono } from 'hono';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { AnalyzeRequest, AnalyzeResponse } from '@react-visual-rendering-tracer/shared-types';
import { createAnalysisJob } from '../services/job-service';
import { analyzeRepository } from '../services/analyzer-service';

type Env = {
  Variables: {
    user: User;
    supabase: SupabaseClient;
  };
};

export const analyzeRouter = new Hono<Env>();

analyzeRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<AnalyzeRequest>();
    const user = c.get('user');
    const supabase = c.get('supabase');

    if (!user || !supabase) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 분석 작업 생성
    const job = await createAnalysisJob(supabase, {
      userId: user.id,
      repositoryUrl: body.repositoryUrl,
      branch: body.branch,
      commitHash: body.commitHash,
    });

    // 비동기로 분석 시작 (Workers CPU 제한 고려)
    // 실제 분석은 별도 Worker나 큐 시스템에서 처리
    analyzeRepository(supabase, job.id, body).catch((error) => {
      console.error('Analysis failed:', error);
    });

    const response: AnalyzeResponse = {
      jobId: job.id,
      status: 'pending',
    };

    return c.json(response, 202);
  } catch (error) {
    console.error('Analyze error:', error);
    return c.json({ error: 'Failed to start analysis' }, 500);
  }
});

