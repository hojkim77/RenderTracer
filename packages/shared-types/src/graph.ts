/**
 * Graph JSON 타입 정의
 * 컴포넌트 노드와 의존성 엣지를 표현
 */

export type NodeType = 'component' | 'context' | 'store' | 'hook';

export type EdgeType = 'props' | 'import' | 'context' | 'state';

export interface ComponentNode {
  id: string;
  type: NodeType;
  name: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  
  // 컴포넌트 특성
  isMemoized: boolean;
  hasUseCallback: boolean;
  hasUseMemo: boolean;
  
  // Hooks 정보
  hooks: {
    useState: string[];      // state 변수명들
    useReducer: string[];    // reducer 이름들
    useContext: string[];    // context 이름들
    useSelector?: string[];   // selector 패턴 (Redux 등)
  };
  
  // Props 정보
  props: string[];
  
  // 렌더링 특이점
  hasListRendering: boolean;      // .map() 사용 여부
  hasConditionalRendering: boolean; // &&, ? : 사용 여부
}

export interface ComponentEdge {
  id: string;
  source: string;  // 노드 ID
  target: string;  // 노드 ID
  type: EdgeType;
  
  // Props 전파 정보
  props?: string[];  // 전달되는 props 목록
  
  // Context 정보
  contextName?: string;
}

export interface GraphData {
  nodes: ComponentNode[];
  edges: ComponentEdge[];
  metadata: {
    projectName: string;
    repositoryUrl: string;
    commitHash: string;
    analyzedAt: string;
    totalComponents: number;
    totalEdges: number;
  };
}

