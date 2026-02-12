import { parseReactComponents } from '@react-visual-rendering-tracer/ast-analyzer';
import { GraphData } from '@react-visual-rendering-tracer/shared-types';
import JSZip, { type JSZipObject } from 'jszip';

/**
 * Zip 파일에서 React 컴포넌트 파일들 추출 및 AST 분석
 */
export async function analyzeZipFile(
  zipBuffer: ArrayBuffer,
  repositoryUrl: string,
  commitHash: string,
  projectName: string
): Promise<GraphData> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const allNodes: any[] = [];
  const allEdges: any[] = [];

  // Zip 파일 내의 모든 파일 순회
  const filePromises: Promise<void>[] = [];

  zip.forEach(async (relativePath: string, file: JSZipObject | null) => {
    // React 관련 파일만 분석 (.tsx, .ts, .jsx, .js)
    if (file && !file.dir && /\.(tsx?|jsx?)$/.test(relativePath)) {
      // node_modules, dist, build 등 제외
      if (
        relativePath.includes('node_modules') ||
        relativePath.includes('dist') ||
        relativePath.includes('build') ||
        relativePath.includes('.next')
      ) {
        return;
      }

      filePromises.push(
        file.async('string').then((sourceCode: string) => {
          try {
            const { nodes, edges } = parseReactComponents({
              sourceCode,
              filePath: relativePath,
            });
            allNodes.push(...nodes);
            allEdges.push(...edges);
          } catch (error) {
            // 개별 파일 파싱 실패는 무시하고 계속 진행
            console.warn(`Failed to parse ${relativePath}:`, error);
          }
        })
      );
    }
  });

  await Promise.all(filePromises);

  // GraphData 생성
  const graphData: GraphData = {
    nodes: allNodes,
    edges: allEdges,
    metadata: {
      projectName,
      repositoryUrl,
      commitHash,
      analyzedAt: new Date().toISOString(),
      totalComponents: allNodes.length,
      totalEdges: allEdges.length,
    },
  };

  return graphData;
}

