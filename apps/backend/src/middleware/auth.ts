import { Context, Next } from 'hono';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  };
  Variables: {
    user: User;
  };
};

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const supabaseUrl = c.env.SUPABASE_URL;
  const supabaseKey = c.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // 사용자 정보를 context에 저장
    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

