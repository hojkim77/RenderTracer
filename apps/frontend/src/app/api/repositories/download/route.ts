import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server/auth';
import { downloadRepository } from '@/lib/services/github-service';
import { arrayBufferToBase64 } from '@/lib/services/repository-service';

/**
 * POST /api/repositories/download
 * GitHub에서 레포지토리 zip 파일 다운로드
 * base64로 인코딩된 zipBuffer 반환
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authResult = await getServerUser(authHeader);

    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, supabase } = authResult;
    const body = await request.json() as {
      owner: string;
      repo: string;
      ref?: string;
    };

    if (!body.owner || !body.repo) {
      return NextResponse.json(
        { error: 'owner and repo are required' },
        { status: 400 }
      );
    }

    // GitHub에서 레포지토리 다운로드
    const zipBuffer = await downloadRepository(
      supabase,
      user.id,
      body.owner,
      body.repo,
      body.ref
    );

    // ArrayBuffer를 base64로 인코딩
    const base64ZipBuffer = arrayBufferToBase64(zipBuffer);

    return NextResponse.json({ zipBuffer: base64ZipBuffer });
  } catch (error) {
    console.error('Download repository error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download repository' },
      { status: 500 }
    );
  }
}

