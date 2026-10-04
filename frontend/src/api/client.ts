const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const getHeaders = (options: RequestInit | undefined) => {
    const headers = new Headers(options?.headers ?? {});

    if (options?.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return headers;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: getHeaders(options),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string' && data.error)
                ? data.error
                : (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string' && data.message)
                    ? data.message
                    : (typeof data === 'object' && data !== null && 'errors' in data && Array.isArray(data.errors) && data.errors.length > 0)
                        ? data.errors[0]?.message ?? 'Request failed'
                        : 'Request failed';

        throw new ApiError(message, response.status);
    }

    return data as T;
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        }),
    put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        }),
    patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        }),
    del: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
