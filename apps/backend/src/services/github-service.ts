import type { SupabaseClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import type { Repository } from '@react-visual-rendering-tracer/shared-types';

/**
 * Supabase에서 사용자의 GitHub 토큰 가져오기
 * GitHub OAuth 연동 시 토큰이 저장되어 있어야 함
 */
async function getGitHubToken(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_github_tokens')
    .select('token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  // 실제 구현에서는 암호화된 토큰을 복호화해야 함
  return data.token;
}

export async function getGitHubRepositories(
  supabase: SupabaseClient,
  userId: string
): Promise<Repository[]> {
  const token = await getGitHubToken(supabase, userId);

  if (!token) {
    // GitHub 토큰이 없으면 빈 배열 반환
    // 프론트엔드에서 GitHub OAuth 연동을 안내해야 함
    return [];
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
    }));
  } catch (error) {
    console.error('Failed to fetch GitHub repositories:', error);
    throw new Error('Failed to fetch GitHub repositories');
  }
}

export async function downloadRepository(
  supabase: SupabaseClient,
  userId: string,
  owner: string,
  repo: string,
  ref?: string
): Promise<ArrayBuffer> {
  const token = await getGitHubToken(supabase, userId);

  if (!token) {
    throw new Error('GitHub token not found');
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.repos.downloadZipballArchive({
      owner,
      repo,
      ref: ref || 'main',
    });

    // data는 ArrayBuffer
    return data as ArrayBuffer;
  } catch (error) {
    console.error('Failed to download repository:', error);
    throw new Error(`Failed to download repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

