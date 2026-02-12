import { NextRequest, NextResponse } from 'next/server';
import { parseReactComponents } from '@react-visual-rendering-tracer/ast-analyzer';
import { GraphData, AnalyzeRequest } from '@react-visual-rendering-tracer/shared-types';
import JSZip, { type JSZipObject } from 'jszip';
import { getServerUser } from '@/lib/auth-server';
import { downloadRepository } from '@/lib/github-service';

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
 * Zip 파일에서 React 컴포넌트 파일들 추출 및 AST 분석
 */
async function analyzeZipFile(
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

/**
 * POST /api/analyze
 * 전체 분석 프로세스 수행:
 * 1. 인증 확인
 * 2. GitHub에서 레포지토리 다운로드
 * 3. AST 분석
 * 4. 결과 반환
 */
export async function POST(request: NextRequest) {
    try {
        // 1. 인증 확인
        const authHeader = request.headers.get('Authorization');
        const authResult = await getServerUser(authHeader);

        if (!authResult) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user, supabase } = authResult;

        // 2. 요청 본문 파싱
        const body = await request.json() as AnalyzeRequest;
        if (!body.repositoryUrl) {
            return NextResponse.json(
                { error: 'repositoryUrl is required' },
                { status: 400 }
            );
        }

        // 3. 레포지토리 URL 파싱
        const repoInfo = parseRepositoryUrl(body.repositoryUrl);
        if (!repoInfo) {
            return NextResponse.json(
                { error: 'Invalid repository URL' },
                { status: 400 }
            );
        }

        // 4. GitHub에서 소스 코드 다운로드
        const zipBuffer = await downloadRepository(
            supabase,
            user.id,
            repoInfo.owner,
            repoInfo.repo,
            body.commitHash || body.branch
        );

        // 5. AST 분석 수행
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
