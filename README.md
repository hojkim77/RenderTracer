# React Visual Fiber Tracer

React 컴포넌트 구조 및 렌더링 전파 경로를 시각화하는 프로파일링 도구

## 📁 프로젝트 구조

```
profile-my-app/
├── apps/
│   └── frontend/          # Next.js 앱 (Vercel 배포)
│       ├── API Routes     # REST API 엔드포인트
│       └── Pages          # 프론트엔드 페이지
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

# 개발 서버 실행
pnpm dev
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요.

## 📦 패키지 설명

### apps/frontend
Next.js 기반 풀스택 애플리케이션
- 프론트엔드: 대시보드, React Flow 기반 시각화, 인스펙터 사이드바
- 백엔드: Next.js API Routes
  - GitHub 연동 (레포지토리 조회, 다운로드)
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

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint
```

## 🚢 배포

- **애플리케이션**: Vercel (Next.js)
- **DB/Auth**: Supabase

### 환경 변수 설정 (Vercel)

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (서버 사이드 전용)
