'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // 로그인되어 있으면 대시보드로 리다이렉트
        router.push('/dashboard');
      } else {
        // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // 로딩 중이거나 리다이렉트 중일 때 표시할 내용
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-lg">로딩 중...</p>
        </div>
      </main>
    );
  }

  return null; // 리다이렉트 중
}

