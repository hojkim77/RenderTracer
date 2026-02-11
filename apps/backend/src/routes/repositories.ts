import { Hono } from 'hono';
import type { User } from '@supabase/supabase-js';
import { getGitHubRepositories } from '../services/github-service';

type Env = {
  Variables: {
    user: User;
  };
};

export const repositoriesRouter = new Hono<Env>();

repositoriesRouter.get('/', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // GitHub 토큰은 Supabase DB에서 가져와야 함
    // 여기서는 예시로 구현
    const repositories = await getGitHubRepositories(user.id);

    return c.json(repositories);
  } catch (error) {
    console.error('Get repositories error:', error);
    return c.json({ error: 'Failed to get repositories' }, 500);
  }
});

