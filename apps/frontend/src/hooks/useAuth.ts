'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getSession } from '@/lib/auth';
import { saveTokensFromSession, getRefreshToken } from '@/lib/tokenStorage';
import type { User } from '@supabase/supabase-js';

/**
 * 인증 상태를 관리하는 커스텀 훅
 * AccessToken은 메모리에, RefreshToken은 localStorage에 저장
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function initializeAuth() {
      try {
        // URL에서 세션 감지 (OAuth 콜백 후, detectSessionInUrl이 활성화되어 있음)
        // Supabase가 URL의 해시나 쿼리 파라미터에서 세션을 감지할 수 있음
        const { data: { session: urlSession }, error: urlError } = await supabase.auth.getSession();

        if (urlSession && !urlError) {
          // URL에서 세션을 감지한 경우 토큰 저장
          saveTokensFromSession(urlSession);
          setUser(urlSession.user);
          setLoading(false);
          return;
        }

        // URL에 세션이 없으면 기존 RefreshToken으로 세션 복원 시도
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // getSession()이 완료될 때까지 loading을 true로 유지
          const session = await getSession();
          if (session) {
            setUser(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
          return;

        }

        // RefreshToken도 없는 경우
        setUser(null);
        setLoading(false);
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        setUser(null);
        setLoading(false);
      }
    }

    // 초기 로딩 상태 유지
    setLoading(true);

    let subscription: { unsubscribe: () => void } | null = null;

    // 초기화 완료 후에만 onAuthStateChange 활성화
    initializeAuth().then(() => {
      // 초기화 완료 후 onAuthStateChange 구독 시작
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          // 세션이 있으면 토큰 저장
          saveTokensFromSession(session);
          setUser(session.user);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, loading };
}
