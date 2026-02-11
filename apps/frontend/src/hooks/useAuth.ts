'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getSession } from '@/lib/auth';
import { saveTokensFromSession, getRefreshToken } from '@/lib/tokenStorage';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const { data: { session: urlSession }, error: urlError } = await supabase.auth.getSession();

        if (urlSession && !urlError) {
          saveTokensFromSession(urlSession);
          setUser(urlSession.user);
          setLoading(false);
          return;
        }

        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const session = await getSession();
          if (session) {
            setUser(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
          return;

        }

        setUser(null);
        setLoading(false);
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        setUser(null);
        setLoading(false);
      }
    }

    setLoading(true);

    let subscription: { unsubscribe: () => void } | null = null;

    initializeAuth().then(() => {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
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
