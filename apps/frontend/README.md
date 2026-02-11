# Frontend (Next.js)

React Visual Fiber Tracer의 프론트엔드 애플리케이션

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **시각화**: React Flow
- **상태 관리**: Zustand
- **인증**: Supabase Auth
- **타입**: TypeScript

## 주요 기능

- 대시보드: 레포지토리 목록 및 분석 히스토리
- 가상 파이버 뷰: React Flow 기반 컴포넌트 그래프 시각화
- 인스펙터 사이드바: 선택한 컴포넌트 상세 정보
- 시뮬레이션 컨트롤러: 렌더링 전파 애니메이션

## 개발

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

## 환경 변수

`.env.local` 파일에 다음 변수들을 설정하세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `WORKERS_API_URL`

