# 프로젝트 설정 가이드

## 📦 프로젝트 구조

```
profile-my-app/
├── apps/
│   ├── frontend/              # Next.js 앱
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React 컴포넌트
│   │   │   └── lib/           # 유틸리티 (Supabase, API 클라이언트)
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── backend/               # Cloudflare Workers (Hono)
│       ├── src/
│       │   ├── routes/        # API 라우트
│       │   ├── services/      # 비즈니스 로직
│       │   ├── middleware/    # 미들웨어 (인증 등)
│       │   └── index.ts       # 진입점
│       ├── package.json
│       └── wrangler.toml
│
├── packages/
│   ├── shared-types/          # 공유 TypeScript 타입
│   │   ├── src/
│   │   │   ├── graph.ts       # Graph JSON 타입
│   │   │   ├── api.ts         # API 타입
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ast-analyzer/          # AST 분석 엔진
│       ├── src/
│       │   └── index.ts       # Babel 기반 분석 로직
│       └── package.json
│
├── package.json               # 루트 (workspaces)
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 프로젝트 루트에서 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

#### 프론트엔드 (`.env.local`)

```bash
cd apps/frontend
cp ../../.env.example .env.local
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (예: `http://localhost:3000`)
- `WORKERS_API_URL` (예: `http://localhost:8787`)

#### 백엔드 (Cloudflare Workers)

```bash
cd apps/backend

# Wrangler CLI로 환경 변수 설정 (npx 사용)
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET

# 또는 pnpm exec 사용
pnpm exec wrangler secret put SUPABASE_URL
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. Database Schema 생성:

```sql
-- 분석 작업 테이블
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  repository_url TEXT NOT NULL,
  branch TEXT,
  commit_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  graph_data_id UUID
);

-- Graph 데이터 테이블
CREATE TABLE graph_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES analysis_jobs(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
```

### 4. GitHub OAuth 설정 (선택사항)

GitHub 레포지토리 연동이 필요할 때만 설정하세요.

#### 4.1 GitHub OAuth App 생성

1. GitHub → Settings → Developer settings → OAuth Apps
2. **New OAuth App** 클릭
3. 새 OAuth App 생성:
   - **Application name**: `React Visual Fiber Tracer`
   - **Homepage URL**: `http://localhost:3000` (개발) / `https://your-app.vercel.app` (프로덕션)
   - **Authorization callback URL**: Supabase에서 제공하는 콜백 URL
     - Supabase Dashboard → Authentication → Providers → GitHub
     - 여기에 표시된 "Redirect URL"을 복사하여 사용
4. **Register application** 클릭
5. **Client ID**와 **Client Secret** 복사 (Client Secret은 한 번만 표시됨)

#### 4.2 Supabase에서 GitHub Provider 활성화

1. Supabase Dashboard → Authentication → Providers → GitHub
2. **Enable GitHub** 토글 활성화
3. 위에서 복사한 **Client ID**와 **Client Secret** 입력
4. **Save** 클릭

### 5. 개발 서버 실행

```bash
# 루트에서 모든 앱 실행
pnpm dev

# 또는 개별 실행
pnpm --filter frontend dev    # http://localhost:3000
pnpm --filter backend dev     # http://localhost:8787
```

## 📝 주요 명령어

```bash
# 개발
pnpm dev                      # 모든 앱 개발 모드
pnpm build                    # 모든 앱 빌드
pnpm lint                     # 모든 앱 린트
pnpm type-check              # 모든 앱 타입 체크

# 특정 패키지만
pnpm --filter frontend dev
pnpm --filter backend dev
pnpm --filter shared-types build
```

## 🔧 문제 해결

### 타입 에러가 발생하는 경우

```bash
# 공유 타입 패키지 빌드
pnpm --filter shared-types build

# 모든 패키지 재빌드
pnpm build
```

### Cloudflare Workers 로컬 실행 오류

```bash
# Wrangler 로그인 확인
wrangler whoami

# 로그인 필요 시
wrangler login
```

### Supabase 연결 오류

- Supabase 프로젝트 URL과 키가 올바른지 확인
- RLS (Row Level Security) 정책이 올바르게 설정되었는지 확인

## 🚢 배포

### 프론트엔드 (Vercel)

1. GitHub에 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (프로덕션 URL)
   - `WORKERS_API_URL` (Cloudflare Workers URL)

### 백엔드 (Cloudflare Workers)

```bash
cd apps/backend
pnpm deploy
```

또는 Wrangler Dashboard에서 배포

## 📚 다음 단계

1. **프론트엔드 컴포넌트 구현**
   - `src/components/FiberGraph/` - React Flow 그래프
   - `src/components/Inspector/` - 사이드바
   - `src/components/SimulationController/` - 시뮬레이션 컨트롤러

2. **백엔드 서비스 구현**
   - `src/services/analyzer-service.ts` - AST 분석 로직 완성
   - `src/services/job-service.ts` - Supabase 연동 완성
   - `src/services/github-service.ts` - GitHub API 연동 완성

3. **AST 분석 엔진 개선**
   - Props 전파 추적
   - Import 관계 추적
   - Context 구독 추적

자세한 내용은 [PROJECT_REVIEW.md](./PROJECT_REVIEW.md)를 참고하세요.

