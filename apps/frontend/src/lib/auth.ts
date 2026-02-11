import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
  clearAllTokens,
  isAccessTokenExpired,
  saveTokensFromSession,
} from './tokenStorage';

export async function refreshAccessToken(): Promise<Session | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      clearAllTokens();
      return null;
    }

    saveTokensFromSession(data.session);
    return data.session;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    clearAllTokens();
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  let token = getAccessToken();

  if (!token || isAccessTokenExpired()) {
    const session = await refreshAccessToken();
    if (session) {
      token = session.access_token;
    } else {
      return null;
    }
  }

  return token;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getValidAccessToken();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getSession(): Promise<Session | null> {
  const token = await getValidAccessToken();

  if (!token) {
    return null;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: getRefreshToken() || '',
  });

  if (error || !session) {
    return null;
  }

  return session;
}

export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  clearAllTokens();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

