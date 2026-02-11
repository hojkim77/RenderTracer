# 빠른 시작 가이드

프로젝트를 실행하기 위한 최소한의 단계를 안내합니다.

## ✅ 필수 단계

### 1. 의존성 설치

```bash
# 프로젝트 루트에서
pnpm install
```

### 2. 서비스 설정 (필수)

#### A. Supabase 설정 (DB + Auth)

1. [Supabase](https://supabase.com) 접속 → 새 프로젝트 생성
2. 프로젝트 생성 후:
   - Settings → API → `URL`과 `anon key` 복사
   - **service_role key**도 복사 (Reveal 버튼 클릭 필요)
   - GitHub OAuth는 나중에 설정 가능 (실제 연동 테스트 시 필요)
     - GitHub에서 OAuth App 생성 필요
     - Supabase에서 GitHub Provider 활성화 필요

   > 📖 **자세한 가이드**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고
   
   > 💡 **GitHub OAuth 설정**: 실제 GitHub 레포지토리 연동이 필요할 때 설정하세요. 
   > [SETUP_GUIDE.md](./SETUP_GUIDE.md#4-github-oauth-app-생성)에서 상세한 방법을 확인할 수 있습니다.

3. Database Schema 생성:
   - SQL Editor에서 아래 SQL 실행:

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

-- 인덱스
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
```

#### B. 환경 변수 설정

**프론트엔드** (`apps/frontend/.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
WORKERS_API_URL=http://localhost:8787
```

**백엔드** (Cloudflare Workers):

```bash
# 백엔드 디렉토리로 이동
cd apps/backend

# Wrangler CLI로 환경 변수 설정 (npx 사용)
npx wrangler secret put SUPABASE_URL
# 입력: Supabase Settings → API → Project URL

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# 입력: Supabase Settings → API → service_role key (Reveal 클릭 필요)

# 또는 pnpm exec 사용
pnpm exec wrangler secret put SUPABASE_URL
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

> 📖 **키 찾는 방법**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고
> 
> **참고**: 개발 초기에는 환경 변수 없이도 로컬 개발 서버는 실행 가능합니다. 
> 실제 배포 시에만 secret 설정이 필요합니다.

> **참고**: 개발 초기에는 백엔드 없이 프론트엔드만 실행해도 UI 확인 가능합니다.

### 3. 개발 서버 실행

```bash
# 프론트엔드만 실행 (백엔드 없이)
pnpm --filter frontend dev

# 또는 모든 앱 실행 (백엔드도 함께)
pnpm dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 🔄 단계별 실행 전략

### Phase 1: 프론트엔드만 실행 (UI 확인)

1. ✅ `pnpm install`
2. ✅ Supabase 프로젝트 생성
3. ✅ `apps/frontend/.env.local` 설정
4. ✅ `pnpm --filter frontend dev`

→ 이 단계에서는 백엔드 없이도 UI 구조를 확인할 수 있습니다.

### Phase 2: 백엔드 연동

1. ✅ Cloudflare Workers 설정
2. ✅ GitHub OAuth App 생성
3. ✅ 환경 변수 추가 설정
4. ✅ `pnpm dev` (프론트엔드 + 백엔드)

→ 이제 실제 API 호출이 가능합니다.

## ⚠️ 주의사항

### 개발 초기 단계

- **Supabase만 설정**해도 프론트엔드는 실행 가능
- 백엔드(Workers)는 나중에 설정해도 됨
- GitHub OAuth는 실제 연동 테스트 시 설정

### 최소 설정으로 시작하기

프로젝트 구조 확인만 하려면:

```bash
# 1. 의존성 설치
pnpm install

# 2. 프론트엔드만 실행 (환경 변수 없이도 빌드 확인 가능)
cd apps/frontend
pnpm dev
```

→ 타입 에러나 빌드 에러 확인 가능

## 📋 체크리스트

실행 전 확인사항:

- [ ] `pnpm install` 완료
- [ ] Supabase 프로젝트 생성
- [ ] `apps/frontend/.env.local` 파일 생성 및 설정
- [ ] (선택) Cloudflare Workers 설정
- [ ] (선택) GitHub OAuth App 생성

## 🆘 문제 해결

### "Cannot find module" 에러

```bash
# 공유 패키지 빌드
pnpm --filter shared-types build
```

### Supabase 연결 오류

- `.env.local` 파일이 `apps/frontend/` 디렉토리에 있는지 확인
- Supabase URL과 Key가 올바른지 확인

### 타입 에러

```bash
# 모든 패키지 빌드
pnpm build
```

## 🎯 다음 단계

프로젝트가 실행되면:

1. UI 컴포넌트 구현 시작
2. AST 분석 엔진 로직 완성
3. 실제 GitHub 레포지토리 연동 테스트

자세한 내용은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참고하세요.

