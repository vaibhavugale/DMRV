const API_BASE = 'https://dmrv-f367.onrender.com/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const activeProjectId = localStorage.getItem('dmrv_active_project');
  let finalEndpoint = endpoint;
  
  if (activeProjectId && !endpoint.startsWith('/projects') && !endpoint.startsWith('/auth')) {
    const divider = endpoint.includes('?') ? '&' : '?';
    finalEndpoint = `${endpoint}${divider}projectId=${activeProjectId}`;
  } else {
    console.warn(`apiFetch: No active project ID found or endpoint is excluded: ${endpoint}`);
  }

  console.log(`Fetching: ${API_BASE}${finalEndpoint}`);

  const res = await fetch(`${API_BASE}${finalEndpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'API request failed');
  }

  return res.json();
}
