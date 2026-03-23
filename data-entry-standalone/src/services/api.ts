import { getToken, getActiveProjectId } from './storage';

// ─── Configuration ───────────────────────────────────

const BASE_URL = 'http://192.168.1.36:3333/api';

// ─── Types ───────────────────────────────────────────

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  skipProjectScope?: boolean;
  params?: Record<string, string>;
}

type ApiResponse<T = any> = T & {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
  error?: string;
};

// ─── API Client ──────────────────────────────────────

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, skipProjectScope = false, params = {} } = options;

  // Build URL with query params
  const url = new URL(`${BASE_URL}${endpoint}`);

  // Auto-inject projectId
  if (!skipProjectScope) {
    const projectId = await getActiveProjectId();
    if (projectId) {
      url.searchParams.set('projectId', projectId);
    }
  }

  // Append custom params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Execute request
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json;
}

// ─── Convenience wrappers ────────────────────────────

export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
