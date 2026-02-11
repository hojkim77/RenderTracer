'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGitHub } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-lg">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4 text-center">
          React Visual Fiber Tracer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
          React 컴포넌트 구조 및 렌더링 전파 경로를 시각화하는 프로파일링 도구
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleGitHubLogin}
            className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            GitHub로 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
