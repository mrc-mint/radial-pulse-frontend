import type { paths } from '@radial-pulse/shared-types';
import createClient, { type Client, type Middleware } from 'openapi-fetch';
import type { AuthBridge } from './auth-bridge';
import { errorFromResponse, networkError, REQUEST_ID_HEADER, timeoutError } from './errors';
import { createRequestId } from './request-id';

/**
 * HTTP transport (architecture §7). An openapi-fetch client typed by the
 * generated contract (`paths` from @radial-pulse/shared-types), so every
 * request and response shape comes from the published API, never from
 * hand-written types. Until a contract is synced `paths` is empty and the
 * client exposes no callable endpoints.
 */
export type ApiClient<Paths extends object = paths> = Client<Paths>;

export interface ApiClientOptions {
  /** AppConfig.apiBaseUrl — the API Gateway domain for the environment. */
  baseUrl: string;
  /** Token and 401 handling, injected by the platform shell. */
  auth: AuthBridge;
  /**
   * Client-side ceiling per request. API Gateway ends integrations at 29s, so
   * the default sits just above it and a gateway 504 normally arrives first.
   */
  timeoutMs?: number;
  fetch?: (request: Request, init?: RequestInit) => Promise<Response>;
  createRequestId?: () => string;
}

export const DEFAULT_TIMEOUT_MS = 30_000;

class RequestTimeout extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'RequestTimeout';
  }
}

const isAbort = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  (error as { name?: unknown }).name === 'AbortError';

function abortReason(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) return signal.reason;
  const error = new Error('The request was aborted');
  error.name = 'AbortError';
  return error;
}

/** Wraps fetch with a timeout that still honours the caller's abort signal. */
function withTimeout(
  baseFetch: NonNullable<ApiClientOptions['fetch']>,
  timeoutMs: number,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new RequestTimeout()), timeoutMs);
    const upstream = request.signal;
    const forwardAbort = () => controller.abort(upstream.reason);
    if (upstream.aborted) forwardAbort();
    else upstream.addEventListener('abort', forwardAbort, { once: true });
    try {
      // Cancelled before sending (e.g. while awaiting the token): don't send.
      if (controller.signal.aborted) throw abortReason(controller.signal);
      return await baseFetch(request, { signal: controller.signal });
    } catch (error) {
      // Some fetch implementations reject with a generic AbortError; report
      // our own timeout distinctly from a caller cancellation.
      if (controller.signal.reason instanceof RequestTimeout) throw controller.signal.reason;
      throw error;
    } finally {
      clearTimeout(timer);
      upstream.removeEventListener('abort', forwardAbort);
    }
  };
}

/** Request id, bearer token, 401 handling and error normalization. */
export function platformMiddleware(
  auth: AuthBridge,
  newRequestId: () => string = createRequestId,
): Middleware {
  return {
    async onRequest({ request }) {
      request.headers.set(REQUEST_ID_HEADER, newRequestId());
      const token = await auth.getAccessToken();
      if (token) request.headers.set('authorization', `Bearer ${token}`);
      return request;
    },
    onResponse({ request, response }) {
      if (response.status === 401) auth.onUnauthorized();
      // Guarantee the id on every response so errors can always quote it.
      if (response.headers.has(REQUEST_ID_HEADER)) return undefined;
      const headers = new Headers(response.headers);
      headers.set(REQUEST_ID_HEADER, request.headers.get(REQUEST_ID_HEADER) ?? '');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    },
    onError({ request, error }) {
      const requestId = request.headers.get(REQUEST_ID_HEADER) ?? undefined;
      if (error instanceof RequestTimeout) return timeoutError(requestId);
      // A caller cancellation (e.g. TanStack Query) is not an API failure.
      if (isAbort(error)) return undefined;
      return networkError(requestId, error);
    },
  };
}

export function createApiClient<Paths extends object = paths>(
  options: ApiClientOptions,
): ApiClient<Paths> {
  const baseFetch = options.fetch ?? ((request, init) => globalThis.fetch(request, init));
  const client = createClient<Paths>({
    baseUrl: options.baseUrl.replace(/\/+$/, ''),
    fetch: withTimeout(baseFetch, options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  client.use(platformMiddleware(options.auth, options.createRequestId));
  return client;
}

/**
 * Turns an openapi-fetch result into data or a thrown ApiRequestError.
 * Services use it so hooks and screens only ever see data or ApiError:
 *
 *   unwrap(client.GET('/path', { params }))
 */
export async function unwrap<T>(
  pending: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await pending;
  if (!response.ok || error !== undefined) throw errorFromResponse(response, error);
  return data as T;
}
