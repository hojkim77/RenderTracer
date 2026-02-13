'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveTokensFromSession } from '@/lib/tokenStorage';
import { saveGitHubToken } from '@/lib/services/github-service';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      if (error) {
        console.error('OAuth error:', error);
        router.push('/login?error=auth_failed');
        return;
      }
      try {
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError || !data.session) {
            console.error('세션 교환 실패:', exchangeError);
            router.push('/login?error=auth_failed');
            return;
          }

          saveTokensFromSession(data.session);

          router.push('/dashboard');
        } else if (!error) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const userId = session.user.id;
            const githubToken = session.provider_token;
            if (userId && githubToken) {
              await saveGitHubToken(supabase, userId, githubToken);
            }

            saveTokensFromSession(session);
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        } else {
          // error가 있는 경우는 이미 위에서 처리됨
          router.push('/login');
        }
      } catch (err) {
        console.error('콜백 처리 실패:', err);
        router.push('/login?error=auth_failed');
      }
    }


    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">로그인 처리 중...</p>
    </div>
  );
}

