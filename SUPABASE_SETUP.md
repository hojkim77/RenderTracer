# Supabase 설정 가이드

Supabase 프로젝트 생성 및 필요한 키 얻는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. **Sign Up** 또는 **Sign In** (GitHub 계정으로 로그인 가능)
3. **New Project** 클릭
4. 프로젝트 정보 입력:
   - **Name**: `react-visual-rendering-tracer` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (나중에 필요)
   - **Region**: 가장 가까운 리전 선택 (예: Northeast Asia (Seoul))
   - **Pricing Plan**: Free 선택
5. **Create new project** 클릭
6. 프로젝트 생성 완료까지 1-2분 대기

## 2. API 키 및 URL 확인

프로젝트가 생성되면:

1. 왼쪽 사이드바에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭

### 필요한 정보

다음 정보를 복사하세요:

#### 1. Project URL
- **Project URL** 섹션에서 확인
- 예: `https://xxxxxxxxxxxxx.supabase.co`
- 이것이 `NEXT_PUBLIC_SUPABASE_URL` 값입니다

#### 2. API Keys
두 가지 키가 있습니다:

**anon/public key** (프론트엔드용):
- **Project API keys** 섹션의 `anon` `public` 키
- 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값입니다
- ⚠️ 이 키는 프론트엔드에서 사용해도 안전합니다 (RLS 정책으로 보호됨)

**service_role key** (백엔드용):
- 같은 섹션의 `service_role` `secret` 키
- 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- 이것이 `SUPABASE_SERVICE_ROLE_KEY` 값입니다
- ⚠️ **절대 프론트엔드에 노출하면 안 됩니다!** 백엔드에서만 사용
- **Reveal** 버튼을 클릭해야 표시됩니다

## 3. 환경 변수 설정

### 프론트엔드 (`apps/frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
WORKERS_API_URL=http://localhost:8787
```

### 백엔드 (Cloudflare Workers)

```bash
cd apps/backend

# Wrangler secret로 설정
npx wrangler secret put SUPABASE_URL
# 입력: https://xxxxxxxxxxxxx.supabase.co

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# 입력: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role 키)
```

## 4. Database Schema 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. **New query** 클릭
3. 아래 SQL을 붙여넣고 실행:

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

4. **Run** 버튼 클릭하여 실행

## 5. Row Level Security (RLS) 설정

보안을 위해 RLS 정책을 설정합니다:

1. **Authentication** → **Policies** 메뉴로 이동
2. `analysis_jobs` 테이블에 대해:
   - **New Policy** 클릭
   - **Policy name**: `Users can view their own jobs`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     (auth.uid() = user_id)
     ```
   - **Save** 클릭

3. `graph_data` 테이블에 대해서도 동일하게 설정

## 6. GitHub OAuth 설정 (선택사항)

나중에 GitHub 연동이 필요하면:

1. **Authentication** → **Providers** 메뉴로 이동
2. **GitHub** 찾아서 **Enable** 클릭
3. GitHub OAuth App 생성 후 Client ID와 Secret 입력
   - GitHub → Settings → Developer settings → OAuth Apps
   - 새 OAuth App 생성
   - Authorization callback URL: Supabase에서 제공하는 URL 사용

## 📝 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Project URL 복사
- [ ] anon/public key 복사
- [ ] service_role key 복사 (Reveal 클릭)
- [ ] 프론트엔드 `.env.local` 파일에 설정
- [ ] 백엔드 wrangler secret 설정
- [ ] Database Schema 생성 완료
- [ ] RLS 정책 설정 (선택사항)

## 🆘 문제 해결

### "Invalid API key" 에러

- 키를 정확히 복사했는지 확인 (앞뒤 공백 제거)
- anon key와 service_role key를 혼동하지 않았는지 확인

### "relation does not exist" 에러

- Database Schema가 제대로 생성되었는지 확인
- SQL Editor에서 테이블 목록 확인: `SELECT * FROM information_schema.tables;`

### service_role key가 보이지 않음

- **Reveal** 버튼을 클릭해야 표시됩니다
- 키는 한 번만 표시되므로 복사해두세요

## 🔗 참고 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Supabase API 문서](https://supabase.com/docs/reference/javascript/introduction)

