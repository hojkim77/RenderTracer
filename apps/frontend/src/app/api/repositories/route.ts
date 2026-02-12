import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { getGitHubRepositories } from '@/lib/github-service';

/**
 * GET /api/repositories
 * 사용자의 GitHub 레포지토리 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authResult = await getServerUser(authHeader);

    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, supabase } = authResult;
    const repositories = await getGitHubRepositories(supabase, user.id);

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Get repositories error:', error);
    return NextResponse.json(
      { error: 'Failed to get repositories' },
      { status: 500 }
    );
  }
}

