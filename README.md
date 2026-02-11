# React Visual Fiber Tracer

React 컴포넌트 구조 및 렌더링 전파 경로를 시각화하는 프로파일링 도구

## 📁 프로젝트 구조

```
profile-my-app/
├── apps/
│   ├── frontend/          # Next.js 앱 (Vercel 배포)
│   └── backend/           # Cloudflare Workers (Hono)
├── packages/
│   ├── shared-types/      # 공유 TypeScript 타입
│   └── ast-analyzer/      # AST 분석 로직
└── docs/                  # 문서
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (프론트엔드 + 백엔드)
pnpm dev
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요.

## 📦 패키지 설명

### apps/frontend
Next.js 기반 프론트엔드 애플리케이션
- 대시보드
- React Flow 기반 시각화
- 인스펙터 사이드바

### apps/backend
Cloudflare Workers 기반 API 서버
- GitHub 연동
- AST 분석 엔진
- Graph JSON 생성

### packages/shared-types
프론트엔드와 백엔드 간 공유 타입 정의

### packages/ast-analyzer
Babel 기반 AST 분석 로직

## 🛠️ 개발

```bash
# 모든 패키지 개발 모드 실행
pnpm dev

# 특정 패키지만 실행
pnpm --filter frontend dev
pnpm --filter backend dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint
```

## 🚢 배포

- **프론트엔드**: Vercel
- **백엔드**: Cloudflare Workers
- **DB/Auth**: Supabase
