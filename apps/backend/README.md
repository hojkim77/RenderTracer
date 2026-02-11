# Backend (Cloudflare Workers + Hono)

React Visual Fiber Tracer의 백엔드 API 서버

## 기술 스택

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **AST 분석**: Babel Parser
- **인증**: Supabase Auth
- **GitHub 연동**: Octokit
- **타입**: TypeScript

## 주요 기능

- GitHub 레포지토리 연동 및 소스 코드 다운로드
- AST 기반 정적 분석 (컴포넌트 스캔, Props 전파 추적)
- Graph JSON 생성
- 분석 작업 큐 관리

## 개발

```bash
# 로컬 개발 서버 실행
pnpm dev

# 배포
pnpm deploy
```

## 환경 변수

Cloudflare Workers 환경 변수 설정:

```bash
# 백엔드 디렉토리에서 실행
cd apps/backend

# Wrangler CLI로 설정 (npx 사용)
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

또는 `wrangler.toml`의 `[vars]` 섹션에 설정 (비밀 정보는 secret 사용)

## API 엔드포인트

- `POST /api/analyze` - 레포지토리 분석 시작
- `GET /api/jobs/:jobId` - 분석 작업 상태 조회
- `GET /api/repositories` - 사용자 GitHub 레포지토리 목록
- `GET /health` - Health check

## 주의사항

- Cloudflare Workers는 CPU 시간 제한이 있으므로, 무거운 AST 분석은 비동기 작업 큐로 처리해야 함
- 대규모 프로젝트 분석 시 청크 단위로 분할 처리 권장

