import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequest } from '@react-visual-rendering-tracer/shared-types';
import { getServerUser } from '@/lib/server/auth';
import { downloadRepository } from '@/lib/services/github-service';
import { analyzeZipFile } from '@/lib/services/analyzer-service';
import { parseRepositoryUrl } from '@/lib/services/repository-service';

/**
 * POST /api/analyze
 * 레포지토리 AST 분석
 */
export async function POST(request: NextRequest) {
    try {
        // 인증 확인
        const authHeader = request.headers.get('Authorization');
        const authResult = await getServerUser(authHeader);

        if (!authResult) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user, supabase } = authResult;

        // 요청 본문 파싱
        const body = await request.json() as AnalyzeRequest;
        if (!body.repositoryUrl) {
            return NextResponse.json(
                { error: 'repositoryUrl is required' },
                { status: 400 }
            );
        }

        // 레포지토리 URL 파싱
        const repoInfo = parseRepositoryUrl(body.repositoryUrl);
        if (!repoInfo) {
            return NextResponse.json(
                { error: 'Invalid repository URL' },
                { status: 400 }
            );
        }

        // GitHub에서 소스 코드 다운로드
        const zipBuffer = await downloadRepository(
            supabase,
            user.id,
            repoInfo.owner,
            repoInfo.repo,
            body.commitHash || body.branch
        );

        // AST 분석 수행
        const graphData = await analyzeZipFile(
            zipBuffer,
            body.repositoryUrl,
            body.commitHash || 'unknown',
            repoInfo.repo
        );

        return NextResponse.json({ success: true, graphData });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
