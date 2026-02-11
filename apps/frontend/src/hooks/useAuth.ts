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
    let mounted = true;

    async function initializeAuth() {
      try {
        // URL에서 세션 감지 (OAuth 콜백 후, detectSessionInUrl이 활성화되어 있음)
        // Supabase가 URL의 해시나 쿼리 파라미터에서 세션을 감지할 수 있음
        const { data: { session: urlSession }, error: urlError } = await supabase.auth.getSession();
        
        if (urlSession && !urlError) {
          // URL에서 세션을 감지한 경우 토큰 저장
          saveTokensFromSession(urlSession);
          if (mounted) {
            setUser(urlSession.user);
            setLoading(false);
            return;
          }
        }

        // URL에 세션이 없으면 기존 RefreshToken으로 세션 복원 시도
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const session = await getSession();
          if (session && mounted) {
            setUser(session.user);
            setLoading(false);
            return;
          }
        }

        // 세션이 없는 경우
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // 인증 상태 변경 감지 (예: 로그인, 로그아웃)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // 세션이 있으면 토큰 저장
        saveTokensFromSession(session);
        if (mounted) {
          setUser(session.user);
          setLoading(false);
        }
      } else {
        // 세션이 없으면 사용자 정보도 제거
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
