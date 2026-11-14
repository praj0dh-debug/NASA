export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg = (typeof data === 'object' && data && 'message' in data)
        ? (data as { message: string }).message
        : `Request failed with status ${res.status}`;
      const errorCode = (typeof data === 'object' && data && 'error' in data)
        ? (data as { error: string }).error
        : 'HTTP_ERROR';
      throw new ApiError(errorMsg, res.status, errorCode);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    const error = err as Error;
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out after 6 seconds. Please verify network connection.', 408, 'TIMEOUT');
    }
    throw new ApiError(error.message || 'Network request failed.', 0, 'NETWORK_ERROR');
  }
}

export const apiClient = {
  getHealth: () => request<{ status: string; uptimeSeconds: number; version: string }>('/health'),

  getProgress: (profileId: string) =>
    request<{ profileId: string; progress: Record<string, any> }>(`/progress?profileId=${encodeURIComponent(profileId)}`),

  saveProgress: (profileId: string, missionId: string, score: number, status: string, attempts?: number) =>
    request<{ success: boolean; updatedMission: any; nextUnlockedMission?: string }>('/progress', {
      method: 'POST',
      body: JSON.stringify({ profileId, missionId, score, status, attempts })
    }),

  getBadges: (profileId: string) =>
    request<{ profileId: string; badges: any[] }>(`/badges?profileId=${encodeURIComponent(profileId)}`),

  awardBadge: (profileId: string, badgeId: string, missionId: string, score: number) =>
    request<{ success: boolean; newlyAwarded: boolean; badge: any }>('/badges', {
      method: 'POST',
      body: JSON.stringify({ profileId, badgeId, missionId, score })
    }),

  submitConsent: (data: { email: string; role: 'parent' | 'teacher'; coppaConfirmed: boolean; educationalConfirmed: boolean; studentId?: string }) =>
    request<{ success: boolean; consentId: string; verifiedEmail: string }>('/parental-consent', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getRoster: (classCode: string = 'NASA-CADET-5A') =>
    request<{ classCode: string; metrics: any; students: any[] }>(`/roster?classCode=${encodeURIComponent(classCode)}`),

  enrollCadet: (data: { id: string; nickname: string; callsign: string; avatar: string; classCode?: string; ageGroup?: string }) =>
    request<{ success: boolean; student: any }>('/roster/join', {
      method: 'POST',
      body: JSON.stringify(data)
    })


};
