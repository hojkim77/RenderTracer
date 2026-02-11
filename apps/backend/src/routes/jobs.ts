import { Hono } from 'hono';
import type { User } from '@supabase/supabase-js';
import { getAnalysisJob } from '../services/job-service';

type Env = {
  Variables: {
    user: User;
  };
};

export const jobsRouter = new Hono<Env>();

jobsRouter.get('/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const job = await getAnalysisJob(jobId, user.id);

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    return c.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    return c.json({ error: 'Failed to get job' }, 500);
  }
});

