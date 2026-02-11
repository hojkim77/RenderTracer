import { Hono } from 'hono';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { getAnalysisJob } from '../services/job-service';

type Env = {
  Variables: {
    user: User;
    supabase: SupabaseClient;
  };
};

export const jobsRouter = new Hono<Env>();

jobsRouter.get('/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const user = c.get('user');
    const supabase = c.get('supabase');

    if (!user || !supabase) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const job = await getAnalysisJob(supabase, jobId, user.id);

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    return c.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    return c.json({ error: 'Failed to get job' }, 500);
  }
});

