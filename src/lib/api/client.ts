/**
 * API client seam.
 *
 * Live chat and speech features use the local backend when VITE_USE_MOCK=false.
 * The Sarvam API key stays server-side and is never exposed to
 * the browser bundle.
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  useMock: (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false',
  /** Simulated latency so loading states are visible in sample mode. */
  mockDelayMs: 900,
} as const;

export async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        const error = payload.error;
        if (typeof error === 'string') message = error;
      }
    } catch {
      // Keep the HTTP status message when the server response isn't JSON.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as TRes;
}

export async function postForm<TRes>(path: string, body: FormData): Promise<TRes> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        const error = payload.error;
        if (typeof error === 'string') message = error;
      }
    } catch {
      // Keep the HTTP status message when the server response isn't JSON.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as TRes;
}

export async function postBlob<TReq>(path: string, body: TReq): Promise<Blob> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        const error = payload.error;
        if (typeof error === 'string') message = error;
      }
    } catch {
      // Keep the HTTP status message when the server response isn't JSON.
    }
    throw new ApiError(res.status, message);
  }
  return res.blob();
}

export async function get<TRes>(path: string): Promise<TRes> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`);
  }
  return (await res.json()) as TRes;
}

export async function remove<TRes>(path: string): Promise<TRes> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        const error = payload.error;
        if (typeof error === 'string') message = error;
      }
    } catch {
      // Keep the HTTP status message when the server response isn't JSON.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as TRes;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
