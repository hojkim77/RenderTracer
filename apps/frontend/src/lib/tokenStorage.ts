/**
 * 토큰 저장소 관리
 * - AccessToken: 메모리에 저장 (XSS 방어)
 * - RefreshToken: localStorage에 저장 (세션 유지)
 */

// 메모리에 AccessToken 저장 (페이지 새로고침 시 사라짐)
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

const REFRESH_TOKEN_KEY = 'sb-refresh-token';

/**
 * AccessToken을 메모리에 저장
 */
export function setAccessToken(token: string, expiresIn: number) {
  accessToken = token;
  // 만료 시간 계산 (현재 시간 + expiresIn 초)
  tokenExpiry = Date.now() + expiresIn * 1000;
}

/**
 * 메모리에서 AccessToken 가져오기
 */
export function getAccessToken(): string | null {
  // 만료 확인
  if (tokenExpiry && Date.now() >= tokenExpiry) {
    accessToken = null;
    tokenExpiry = null;
    return null;
  }
  return accessToken;
}

/**
 * AccessToken 제거
 */
export function clearAccessToken() {
  accessToken = null;
  tokenExpiry = null;
}

/**
 * RefreshToken을 localStorage에 저장
 */
export function setRefreshToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

/**
 * localStorage에서 RefreshToken 가져오기
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

/**
 * RefreshToken 제거
 */
export function clearRefreshToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/**
 * 모든 토큰 제거
 */
export function clearAllTokens() {
  clearAccessToken();
  clearRefreshToken();
}

/**
 * AccessToken이 만료되었는지 확인
 */
export function isAccessTokenExpired(): boolean {
  if (!tokenExpiry) {
    return true;
  }
  return Date.now() >= tokenExpiry;
}

/**
 * Supabase 세션에서 토큰을 분리하여 저장
 * (외부에서 import하여 사용)
 */
export function saveTokensFromSession(session: { access_token: string; refresh_token?: string; expires_in?: number }) {
  if (session.access_token) {
    const expiresIn = session.expires_in || 3600;
    setAccessToken(session.access_token, expiresIn);
  }

  if (session.refresh_token) {
    setRefreshToken(session.refresh_token);
  }
}

