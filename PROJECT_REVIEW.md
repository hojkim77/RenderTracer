# React Visual Fiber Tracer - 프로젝트 검토 및 개선사항

## 🔴 주요 잠재적 문제점 및 해결 방안

### 1. **Cloudflare Workers CPU 시간 제한 문제**

**문제:**
- Cloudflare Workers 무료 플랜: CPU 시간 10ms 제한 (유료 플랜도 30초)
- Babel AST 분석은 CPU 집약적 작업으로, 대규모 프로젝트 분석 시 타임아웃 발생 가능

**해결 방안:**
1. **비동기 작업 큐 패턴**
   - Workers는 분석 요청을 받아 Supabase DB에 작업 상태만 저장
   - 별도의 Worker 또는 GitHub Actions로 실제 AST 분석 수행
   - 또는 Cloudflare Queues 사용 (유료 플랜 필요)

2. **청크 단위 분석**
   - 프로젝트를 파일 단위로 나누어 여러 요청으로 분산 처리
   - 프론트엔드에서 진행률 표시

3. **캐싱 전략**
   - 동일 레포지토리/커밋 분석 결과는 DB에 캐싱
   - 재분석 요청 시 즉시 반환

### 2. **GitHub OAuth + Supabase Auth 통합 복잡성**

**문제:**
- Supabase Auth와 GitHub OAuth를 동시에 사용할 때 토큰 관리 복잡
- Workers에서 Supabase 토큰 검증 후 GitHub API 호출 권한 처리

**해결 방안:**
1. **Supabase Auth에 GitHub Provider 직접 연동**
   - Supabase Dashboard에서 GitHub OAuth 설정
   - 사용자는 Supabase Auth로 로그인하되, GitHub 계정 연동
   - `supabase.auth.getSession()`으로 토큰 획득

2. **토큰 전달 방식**
   ```
   Next.js → Supabase Auth 로그인
   → Access Token을 Workers API 호출 시 Header에 포함
   → Workers에서 Supabase Admin API로 토큰 검증
   → 검증 성공 시 GitHub API 호출 (사용자 GitHub Token은 Supabase DB에 저장)
   ```

### 3. **AST 분석의 정확도 한계**

**문제:**
- 정적 분석만으로는 런타임 렌더링 전파를 완벽히 예측 불가
- `useTransition()`, `useDeferredValue()` 등 Concurrent API는 분석 어려움
- 동적 컴포넌트 로딩(`React.lazy`, `dynamic import`) 추적 복잡

**해결 방안:**
1. **MVP 범위 제한**
   - 초기에는 Props 전파 + React.memo 패턴에 집중
   - 점진적으로 Context, Redux 등 확장

2. **사용자 피드백 수집**
   - "이 분석이 실제와 일치하나요?" 피드백 버튼
   - 오탐(False Positive) 데이터 수집하여 분석 엔진 개선

### 4. **프론트엔드 성능 (React Flow 대규모 렌더링)**

**문제:**
- 수백 개의 노드를 React Flow로 렌더링 시 성능 저하
- 줌/패닝 시 프레임 드롭 가능

**해결 방안:**
1. **가상화 (Virtualization)**
   - 화면에 보이는 노드만 렌더링
   - `react-window` 또는 React Flow 내장 최적화 활용

2. **LOD (Level of Detail)**
   - 줌 레벨에 따라 노드 디테일 조절
   - 멀리 있을 때는 간단한 도형, 가까이서는 상세 정보

3. **WebGL 렌더링**
   - React Flow 대신 `react-force-graph` 또는 커스텀 WebGL 캔버스
   - 수천 개 노드도 부드럽게 처리 가능

### 5. **모노레포 구조 및 타입 공유**

**문제:**
- 프론트엔드와 백엔드 간 Graph JSON 타입 정의 중복
- API 응답/요청 타입 불일치 가능

**해결 방안:**
1. **공유 패키지 생성**
   ```
   packages/
   ├── shared-types/     # Graph JSON, API 타입 정의
   ├── ast-analyzer/     # AST 분석 로직 (BE에서 사용)
   └── utils/            # 공통 유틸리티
   ```

2. **TypeScript 프로젝트 참조**
   - `tsconfig.json`에서 `references` 사용
   - 타입 변경 시 양쪽 모두 타입 체크

### 6. **CORS 및 인증 헤더 처리**

**문제:**
- Vercel (Next.js) → Cloudflare Workers API 호출 시 CORS 설정 필요
- 인증 토큰을 안전하게 전달해야 함

**해결 방안:**
1. **Workers CORS 설정**
   ```typescript
   // Hono CORS 미들웨어
   app.use('/*', cors({
     origin: ['https://your-app.vercel.app'],
     credentials: true,
   }))
   ```

2. **토큰 전달**
   - `Authorization: Bearer <supabase-token>` 헤더 사용
   - Workers에서 Supabase Admin API로 검증

### 7. **파일 저장소 선택 (Supabase Storage vs Cloudflare R2)**

**문제:**
- GitHub 레포지토리 Zip 파일 저장 위치
- 분석 결과 캐시 저장

**권장:**
- **Supabase Storage**: 이미 Supabase 사용 중이므로 통합 관리 편리
- **Cloudflare R2**: Workers와 같은 네트워크라 속도 빠름, 하지만 별도 설정 필요

**결론**: 초기에는 Supabase Storage 사용, 트래픽 증가 시 R2로 마이그레이션 고려

---

## ✅ 권장 모노레포 구조

```
profile-my-app/
├── apps/
│   ├── frontend/              # Next.js 앱
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── backend/               # Cloudflare Workers (Hono)
│       ├── src/
│       ├── wrangler.toml
│       └── package.json
│
├── packages/
│   ├── shared-types/          # 공유 TypeScript 타입
│   │   ├── src/
│   │   │   ├── graph.ts       # Graph JSON 타입
│   │   │   ├── api.ts         # API 요청/응답 타입
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ast-analyzer/          # AST 분석 로직 (BE에서 사용)
│   │   ├── src/
│   │   │   ├── babel-parser.ts
│   │   │   ├── component-scanner.ts
│   │   │   └── graph-builder.ts
│   │   └── package.json
│   │
│   └── ui-components/         # 공유 UI 컴포넌트 (선택사항)
│       └── package.json
│
├── package.json               # 루트 package.json (workspaces)
├── pnpm-workspace.yaml        # 또는 npm/yarn workspaces
├── turbo.json                 # Turborepo 설정 (선택사항)
└── README.md
```

---

## 🎯 MVP 우선순위 제안

### Phase 1: 기본 구조
1. 모노레포 설정 (pnpm workspaces)
2. Next.js + Hono 기본 구조
3. Supabase 연동 (Auth, DB)
4. GitHub OAuth 연동

### Phase 2: 핵심 기능
1. 간단한 React 프로젝트 AST 분석 (컴포넌트 스캔만)
2. Graph JSON 생성
3. React Flow로 기본 시각화

### Phase 3: 고급 기능
1. Props 전파 추적
2. React.memo 감지
3. 시뮬레이션 애니메이션

### Phase 4: 확장
1. Context/Redux 추적
2. 성능 최적화 (가상화, LOD)
3. 배지 서비스

---

## 📝 추가 고려사항

1. **환경 변수 관리**
   - `.env.example` 파일 생성
   - Vercel, Cloudflare Workers 환경 변수 설정 가이드 작성

2. **로깅 및 모니터링**
   - Cloudflare Workers: `console.log` → Cloudflare Dashboard
   - Vercel: Vercel Analytics 또는 Sentry 연동

3. **에러 처리**
   - AST 파싱 실패 시 사용자 친화적 에러 메시지
   - GitHub API Rate Limit 대응

4. **보안**
   - GitHub Token은 Supabase DB에 암호화 저장
   - Workers에서 민감 정보 로깅 금지

