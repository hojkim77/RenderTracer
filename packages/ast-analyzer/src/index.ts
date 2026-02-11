/**
 * AST 분석 엔진
 * Babel을 활용하여 React 컴포넌트 구조 분석
 */

import { parse } from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { GraphData, ComponentNode, ComponentEdge } from '@react-visual-rendering-tracer/shared-types';

export interface ParseOptions {
  sourceCode: string;
  filePath: string;
}

export function parseReactComponents(options: ParseOptions): {
  nodes: ComponentNode[];
  edges: ComponentEdge[];
} {
  const { sourceCode, filePath } = options;
  const nodes: ComponentNode[] = [];
  const edges: ComponentEdge[] = [];

  try {
    const ast = parse(sourceCode, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
      ],
    });

    traverse(ast, {
      // FunctionDeclaration 및 ArrowFunctionExpression에서 컴포넌트 찾기
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        if (isReactComponent(path.node)) {
          const node = extractComponentNode(path.node, filePath, sourceCode);
          if (node) {
            nodes.push(node);
          }
        }
      },
      VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
        if (
          path.node.init &&
          (t.isArrowFunctionExpression(path.node.init) ||
          t.isFunctionExpression(path.node.init))
        ) {
          if (isReactComponent(path.node.init)) {
            const node = extractComponentNode(
              path.node.init,
              filePath,
              sourceCode,
              path.node.id && t.isIdentifier(path.node.id) ? path.node.id.name : undefined
            );
            if (node) {
              nodes.push(node);
            }
          }
        }
      },
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('AST parsing error:', error.message);
    }
  }

  return { nodes, edges };
}

function isReactComponent(node: t.Function | t.ArrowFunctionExpression): boolean {
  // JSX를 반환하는 함수인지 확인
  let hasJSX = false;

  traverse(node as any, {
    JSXElement(path: NodePath<t.JSXElement>) {
      hasJSX = true;
      path.stop();
    },
    JSXFragment(path: NodePath<t.JSXFragment>) {
      hasJSX = true;
      path.stop();
    },
  });

  return hasJSX;
}

function extractComponentNode(
  node: t.Function | t.ArrowFunctionExpression,
  filePath: string,
  sourceCode: string,
  name?: string
): ComponentNode | null {
  // 컴포넌트 이름 추출
  const componentName =
    name ||
    (t.isFunctionDeclaration(node) && t.isIdentifier(node.id)
      ? node.id.name
      : 'AnonymousComponent');

  // Props 추출
  const props: string[] = [];
  if (node.params.length > 0) {
    const firstParam = node.params[0];
    if (t.isIdentifier(firstParam)) {
      // 단순 identifier인 경우
      props.push(firstParam.name);
    } else if (t.isObjectPattern(firstParam)) {
      // 객체 구조 분해인 경우: { prop1, prop2 } = props
      firstParam.properties.forEach((prop) => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          props.push(prop.key.name);
        } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
          props.push(prop.argument.name);
        }
      });
    } else if (t.isArrayPattern(firstParam)) {
      // 배열 구조 분해인 경우: [item1, item2] = props
      firstParam.elements.forEach((elem) => {
        if (elem && t.isIdentifier(elem)) {
          props.push(elem.name);
        }
      });
    }
  }

  // Hooks 추출
  const hooks = {
    useState: [] as string[],
    useReducer: [] as string[],
    useContext: [] as string[],
  };

  // React.memo, useCallback, useMemo 감지
  let isMemoized = false;
  let hasUseCallback = false;
  let hasUseMemo = false;
  let hasListRendering = false;
  let hasConditionalRendering = false;

  traverse(node as any, {
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;
      
      if (t.isMemberExpression(callee) && t.isIdentifier(callee.object)) {
        // React.memo 체크
        if (
          t.isIdentifier(callee.object, { name: 'React' }) &&
          t.isIdentifier(callee.property, { name: 'memo' })
        ) {
          isMemoized = true;
        }
      }

      if (t.isIdentifier(callee)) {
        // Hooks 체크
        if (callee.name === 'useState') {
          // useState의 첫 번째 인자에서 초기값 타입 추론은 어렵지만,
          // 변수명은 destructuring에서 추출 가능
          const parent = path.parentPath;
          if (parent && t.isVariableDeclarator(parent.node)) {
            if (t.isIdentifier(parent.node.id)) {
              hooks.useState.push(parent.node.id.name);
            }
          }
        } else if (callee.name === 'useReducer') {
          // useReducer의 첫 번째 인자에서 reducer 함수명 추출 시도
          if (path.node.arguments.length > 0) {
            const reducerArg = path.node.arguments[0];
            if (t.isIdentifier(reducerArg)) {
              hooks.useReducer.push(reducerArg.name);
            }
          }
        } else if (callee.name === 'useContext') {
          // useContext의 인자에서 Context 이름 추출
          if (path.node.arguments.length > 0) {
            const contextArg = path.node.arguments[0];
            if (t.isIdentifier(contextArg)) {
              hooks.useContext.push(contextArg.name);
            } else if (t.isMemberExpression(contextArg) && t.isIdentifier(contextArg.property)) {
              hooks.useContext.push(contextArg.property.name);
            }
          }
        } else if (callee.name === 'useCallback') {
          hasUseCallback = true;
        } else if (callee.name === 'useMemo') {
          hasUseMemo = true;
        }
      }

      // .map() 체크 (리스트 렌더링)
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property, { name: 'map' })
      ) {
        hasListRendering = true;
      }
    },
    ConditionalExpression() {
      hasConditionalRendering = true;
    },
    LogicalExpression(path: NodePath<t.LogicalExpression>) {
      if (path.node.operator === '&&' || path.node.operator === '||') {
        hasConditionalRendering = true;
      }
    },
  });

  // 라인 번호 추출
  const loc = node.loc;
  const lineNumber = loc?.start.line || 0;
  const columnNumber = loc?.start.column || 0;

  return {
    id: `${filePath}:${componentName}:${lineNumber}`,
    type: 'component',
    name: componentName,
    filePath,
    lineNumber,
    columnNumber,
    isMemoized,
    hasUseCallback,
    hasUseMemo,
    hooks,
    props,
    hasListRendering,
    hasConditionalRendering,
  };
}

