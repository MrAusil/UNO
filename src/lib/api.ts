const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}/api${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || 'Request failed' };
    }

    return { data: json };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const api = {
  getRoomInfo: (roomCode: string) =>
    request<{ exists: boolean; playerCount: number; maxPlayers: number; status: string }>(
      `/room/${roomCode}`
    ),
  
  checkHealth: () => request<{ status: string }>('/health'),
};
