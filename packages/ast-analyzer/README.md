# @react-visual-rendering-tracer/ast-analyzer

Babel 기반 AST 분석 엔진 패키지

## 기능

- React 컴포넌트 스캔 (FunctionDeclaration, ArrowFunction)
- Hooks 감지 (useState, useReducer, useContext)
- 최적화 패턴 감지 (React.memo, useCallback, useMemo)
- 렌더링 특이점 감지 (리스트 렌더링, 조건부 렌더링)

## 사용법

```typescript
import { parseReactComponents } from '@react-visual-rendering-tracer/ast-analyzer';

const { nodes, edges } = parseReactComponents({
  sourceCode: '...',
  filePath: 'src/App.tsx',
});
```

## TODO

- Props 전파 추적
- Import 관계 추적
- Context 구독 추적
- 더 정확한 컴포넌트 식별

