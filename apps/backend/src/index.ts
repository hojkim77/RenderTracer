import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { analyzeRouter } from './routes/analyze';
import { jobsRouter } from './routes/jobs';
import { repositoriesRouter } from './routes/repositories';
import { authMiddleware } from './middleware/auth';

import type { User } from '@supabase/supabase-js';

type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };
  Variables: {
    user: User;
  };
};

const app = new Hono<Env>();

// CORS 설정
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true,
}));

// 인증 미들웨어 (일부 엔드포인트에만 적용)
app.use('/api/*', authMiddleware);

// 라우트 등록
app.route('/api/analyze', analyzeRouter);
app.route('/api/jobs', jobsRouter);
app.route('/api/repositories', repositoriesRouter);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

