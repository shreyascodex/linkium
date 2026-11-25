import type { ApiErrorDetail } from '@/src/types/auth';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
}

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors: ApiErrorDetail[];

  constructor(message: string, statusCode: number, errors: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  public get primaryCode(): string | undefined {
    return this.errors[0]?.code;
  }

  public getFieldError(field: string): string | undefined {
    return this.errors.find((item) => item.field === field)?.message;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

// Security: CSRF token is kept strictly in JS memory, never in localStorage or sessionStorage.
let inMemoryCsrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export function clearCsrfToken(): void {
  inMemoryCsrfToken = null;
  csrfPromise = null;
}

function buildUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export async function fetchCsrfToken(forceRefresh = false): Promise<string> {
  if (inMemoryCsrfToken && !forceRefresh) {
    return inMemoryCsrfToken;
  }
  if (csrfPromise && !forceRefresh) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    const response = await fetch(buildUrl('/api/v1/auth/csrf'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    const payload = (await parseJsonSafe(response)) as
      | ApiSuccessResponse<{ csrfToken: string }>
      | ApiErrorResponse
      | null;

    if (!response.ok || !payload || !payload.success) {
      inMemoryCsrfToken = null;
      throw new ApiClientError(
        payload?.message ?? 'Unable to initialize security token.',
        response.status,
        payload && !payload.success ? payload.errors : []
      );
    }

    inMemoryCsrfToken = payload.data.csrfToken;
    return inMemoryCsrfToken;
  })();

  try {
    return await csrfPromise;
  } finally {
    csrfPromise = null;
  }
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  requiresCsrf?: boolean;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiSuccessResponse<T>> {
  const { method = 'GET', body, requiresCsrf = false, signal } = options;

  const execute = async (forceCsrfRefresh = false): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (requiresCsrf) {
      const token = await fetchCsrfToken(forceCsrfRefresh);
      headers['X-CSRF-Token'] = token;
    }

    return fetch(buildUrl(path), {
      method,
      credentials: 'include',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let response: Response;
  try {
    response = await execute(false);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      'Unable to reach the server. Please check your connection and try again.',
      0
    );
  }

  let payload = (await parseJsonSafe(response)) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null;

  // Transparently refresh CSRF token once if server reports missing/stale CSRF
  if (
    requiresCsrf &&
    response.status === 403 &&
    payload &&
    !payload.success &&
    (payload.errors?.[0]?.code === 'CSRF_TOKEN_INVALID' ||
      payload.errors?.[0]?.code === 'CSRF_TOKEN_MISSING')
  ) {
    clearCsrfToken();
    response = await execute(true);
    payload = (await parseJsonSafe(response)) as
      | ApiSuccessResponse<T>
      | ApiErrorResponse
      | null;
  }

  if (!response.ok || !payload || !payload.success) {
    const fallbackMessage =
      response.status === 503
        ? 'Service temporarily unavailable. Please verify backend database connectivity.'
        : 'Request failed. Please try again.';
    throw new ApiClientError(
      payload?.message ?? fallbackMessage,
      response.status,
      payload && !payload.success ? payload.errors ?? [] : []
    );
  }

  return payload;
}
