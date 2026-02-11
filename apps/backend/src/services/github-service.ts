import { Octokit } from '@octokit/rest';

export async function getGitHubRepositories(userId: string): Promise<any[]> {
  // TODO: Supabase에서 사용자의 GitHub 토큰 가져오기
  // const token = await getGitHubToken(userId);

  // const octokit = new Octokit({ auth: token });
  // const { data } = await octokit.repos.listForAuthenticatedUser();

  // return data.map((repo) => ({
  //   id: repo.id,
  //   name: repo.name,
  //   fullName: repo.full_name,
  //   url: repo.html_url,
  //   isPrivate: repo.private,
  //   defaultBranch: repo.default_branch,
  // }));

  // 임시 반환
  return [];
}

export async function downloadRepository(
  owner: string,
  repo: string,
  ref?: string
): Promise<Buffer> {
  // TODO: GitHub API로 레포지토리 Zip 다운로드
  // const octokit = new Octokit({ auth: token });
  // const { data } = await octokit.repos.downloadZipballArchive({
  //   owner,
  //   repo,
  //   ref: ref || 'main',
  // });
  // return Buffer.from(data);

  throw new Error('Not implemented');
}

