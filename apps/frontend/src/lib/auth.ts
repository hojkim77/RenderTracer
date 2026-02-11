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

/**
 * RefreshToken을 사용하여 AccessToken 갱신
 */
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
      // RefreshToken이 만료되었거나 유효하지 않음
      clearAllTokens();
      return null;
    }

    // 새 토큰 저장
    saveTokensFromSession(data.session);
    return data.session;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    clearAllTokens();
    return null;
  }
}

/**
 * 유효한 AccessToken 가져오기 (필요시 자동 갱신)
 */
export async function getValidAccessToken(): Promise<string | null> {
  let token = getAccessToken();

  // AccessToken이 없거나 만료된 경우 RefreshToken으로 갱신 시도
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

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getValidAccessToken();

  if (!token) {
    return null;
  }

  // AccessToken을 사용하여 사용자 정보 가져오기
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * 현재 세션 가져오기 (토큰 갱신 포함)
 */
export async function getSession(): Promise<Session | null> {
  const token = await getValidAccessToken();

  if (!token) {
    return null;
  }

  // Supabase 클라이언트에 토큰 설정
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

/**
 * GitHub로 로그인 시작
 */
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

/**
 * 로그아웃
 */
export async function signOut() {
  clearAllTokens();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

