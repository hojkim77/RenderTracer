import { getValidAccessToken } from './auth';

const API_URL = process.env.WORKERS_API_URL || process.env.NEXT_PUBLIC_APP_URL || '';

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
  }

  return response;
}

export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

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

export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

