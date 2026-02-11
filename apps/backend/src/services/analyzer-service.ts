import { AnalyzeRequest } from '@react-visual-rendering-tracer/shared-types';
import { updateJobStatus } from './job-service';
// import { parseReactComponents } from '@react-visual-rendering-tracer/ast-analyzer'; // 추후 구현

export async function analyzeRepository(
  jobId: string,
  request: AnalyzeRequest
): Promise<void> {
  try {
    await updateJobStatus(jobId, 'processing', 0);

    // 1. GitHub에서 소스 코드 다운로드
    // TODO: GitHub API로 레포지토리 코드 가져오기

    // 2. AST 분석
    // TODO: Babel로 AST 파싱 및 컴포넌트 추출
    // const graphData = await parseAST(sourceCode);

    // 3. Graph JSON 생성
    // TODO: GraphData 생성

    // 4. 결과 저장
    // TODO: Supabase에 GraphData 저장

    await updateJobStatus(jobId, 'completed', 100);
  } catch (error) {
    console.error('Analysis error:', error);
    await updateJobStatus(
      jobId,
      'failed',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

