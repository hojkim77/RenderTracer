import type { SupabaseClient } from '@supabase/supabase-js';
import { AnalyzeRequest, GraphData } from '@react-visual-rendering-tracer/shared-types';
import { updateJobStatus, saveGraphData, getAnalysisJob } from './job-service';
import { downloadRepository } from './github-service';
import { parseReactComponents } from '@react-visual-rendering-tracer/ast-analyzer';
import JSZip, { type JSZipObject } from 'jszip';

/**
 * 레포지토리 URL에서 owner와 repo 추출
 */
function parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return null;
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * Zip 파일에서 React 컴포넌트 파일들 추출 및 분석
 */
async function analyzeZipFile(zipBuffer: ArrayBuffer): Promise<GraphData> {
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
      projectName: 'Unknown',
      repositoryUrl: '',
      commitHash: '',
      analyzedAt: new Date().toISOString(),
      totalComponents: allNodes.length,
      totalEdges: allEdges.length,
    },
  };

  return graphData;
}

export async function analyzeRepository(
  supabase: SupabaseClient,
  jobId: string,
  request: AnalyzeRequest
): Promise<void> {
  try {
    await updateJobStatus(supabase, jobId, 'processing', 0);

    // 1. Job 정보 가져오기
    const job = await getAnalysisJob(supabase, jobId, '');
    if (!job) {
      throw new Error('Job not found');
    }

    // 2. 레포지토리 URL 파싱
    const repoInfo = parseRepositoryUrl(request.repositoryUrl);
    if (!repoInfo) {
      throw new Error('Invalid repository URL');
    }

    // 3. GitHub에서 소스 코드 다운로드
    await updateJobStatus(supabase, jobId, 'processing', 20);
    const zipBuffer = await downloadRepository(
      supabase,
      job.userId,
      repoInfo.owner,
      repoInfo.repo,
      request.commitHash || request.branch
    );

    // 4. AST 분석
    await updateJobStatus(supabase, jobId, 'processing', 40);
    const graphData = await analyzeZipFile(zipBuffer);

    // 5. 메타데이터 업데이트
    graphData.metadata.repositoryUrl = request.repositoryUrl;
    graphData.metadata.commitHash = request.commitHash || 'unknown';
    graphData.metadata.projectName = repoInfo.repo;

    // 6. 결과 저장
    await updateJobStatus(supabase, jobId, 'processing', 80);
    await saveGraphData(supabase, jobId, graphData);

    await updateJobStatus(supabase, jobId, 'completed', 100);
  } catch (error) {
    console.error('Analysis error:', error);
    await updateJobStatus(
      supabase,
      jobId,
      'failed',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

