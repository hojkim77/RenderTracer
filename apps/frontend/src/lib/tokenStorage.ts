let accessToken: string | null = null;
let tokenExpiry: number | null = null;

const REFRESH_TOKEN_KEY = 'sb-refresh-token';

export function setAccessToken(token: string, expiresIn: number) {
  accessToken = token;
  tokenExpiry = Date.now() + expiresIn * 1000;
}

export function getAccessToken(): string | null {
  if (tokenExpiry && Date.now() >= tokenExpiry) {
    accessToken = null;
    tokenExpiry = null;
    return null;
  }
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  tokenExpiry = null;
}

export function setRefreshToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

export function clearRefreshToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAllTokens() {
  clearAccessToken();
  clearRefreshToken();
}

export function isAccessTokenExpired(): boolean {
  if (!tokenExpiry) {
    return true;
  }
  return Date.now() >= tokenExpiry;
}

export function saveTokensFromSession(session: { access_token: string; refresh_token?: string; expires_in?: number }) {
  if (session.access_token) {
    const expiresIn = session.expires_in || 3600;
    setAccessToken(session.access_token, expiresIn);
  }

  if (session.refresh_token) {
    setRefreshToken(session.refresh_token);
  }
}

