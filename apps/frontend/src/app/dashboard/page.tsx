'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { apiGet } from '@/lib/apiClient';
import type { Repository } from '@react-visual-rendering-tracer/shared-types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!user) return;

      try {
        setReposLoading(true);
        setReposError(null);
        const repos = await apiGet<Repository[]>('/api/repositories/');
        setRepositories(repos);
      } catch (error) {
        console.error('레포지토리 조회 실패:', error);
        setReposError('레포지토리를 불러오는데 실패했습니다.');
      } finally {
        setReposLoading(false);
      }
    };

    if (user) {
      fetchRepositories();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleAnalyze = (repo: Repository) => {
    router.push(`/analyze?repo=${encodeURIComponent(repo.fullName)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.email || user.user_metadata?.user_name || '사용자'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">레포지토리</h2>
        
        {reposLoading ? (
          <p className="text-gray-600 dark:text-gray-400">레포지토리를 불러오는 중...</p>
        ) : reposError ? (
          <p className="text-red-500">{reposError}</p>
        ) : repositories.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">레포지토리가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1" title={repo.name}>
                    {repo.name}
                  </h3>
                  {repo.isPrivate && (
                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3" title={repo.fullName}>
                  {repo.fullName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  Branch: {repo.defaultBranch}
                </p>
                
                {/* 호버 시 표시되는 트리 분석 버튼 */}
                <button
                  onClick={() => handleAnalyze(repo)}
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  트리 분석
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

