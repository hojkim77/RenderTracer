import { Hono } from 'hono';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { getGitHubRepositories } from '../services/github-service';

type Env = {
  Variables: {
    user: User;
    supabase: SupabaseClient;
  };
};

export const repositoriesRouter = new Hono<Env>();

repositoriesRouter.get('/', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = c.get('supabase');
    if (!supabase) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const repositories = await getGitHubRepositories(supabase, user.id);

    return c.json(repositories);
  } catch (error) {
    console.error('Get repositories error:', error);
    return c.json({ error: 'Failed to get repositories' }, 500);
  }
});

