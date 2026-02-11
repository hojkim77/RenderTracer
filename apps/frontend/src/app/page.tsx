export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          React Visual Fiber Tracer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          React 컴포넌트 구조 및 렌더링 전파 경로를 시각화하는 프로파일링 도구
        </p>
      </div>
    </main>
  );
}

