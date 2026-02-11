'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없을 때만 리다이렉트
    // loading이 true인 동안은 리다이렉트하지 않음 (인증 확인 중)
    if (loading) {
      return; // 아직 로딩 중이면 리다이렉트하지 않음
    }
    
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
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
      <p className="text-gray-600 dark:text-gray-400">
        레포지토리 목록 및 분석 리포트 히스토리가 여기에 표시됩니다.
      </p>
    </div>
  );
}

