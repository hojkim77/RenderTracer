'use client';

import { useSearchParams } from 'next/navigation';

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">가상 파이버 뷰</h1>
      {repo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">분석 대상 레포지토리</p>
          <p className="text-lg font-semibold">{repo}</p>
        </div>
      )}
      <p className="text-gray-600 dark:text-gray-400">
        React Flow를 활용한 컴포넌트 노드와 의존성 엣지 시각화가 여기에 표시됩니다.
      </p>
    </div>
  );
}

