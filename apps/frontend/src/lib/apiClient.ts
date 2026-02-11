import { getValidAccessToken } from './auth';

const API_URL = process.env.WORKERS_API_URL || process.env.NEXT_PUBLIC_APP_URL || '';

/**
 * 인증 토큰을 포함한 API 요청 클라이언트
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // AccessToken이 있으면 Authorization 헤더에 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 Unauthorized 응답 시 토큰이 만료되었을 수 있음
  if (response.status === 401) {
    // 토큰 갱신 후 재시도는 getValidAccessToken에서 처리됨
    // 여기서는 그냥 응답 반환
  }

  return response;
}

/**
 * GET 요청
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * POST 요청
 */
export async function apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * PUT 요청
 */
export async function apiPut<T = any>(endpoint: string, data?: any): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * DELETE 요청
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

