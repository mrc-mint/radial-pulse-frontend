/**
 * Every failure is normalized into one ApiError, whether it came from
 * API Gateway (authorizer 401/403, throttling 429, integration timeout 504)
 * or from FastAPI (including 422 validation detail). See architecture §7.
 */
export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'server';

export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly message: string;
  /** Echo of x-request-id so support can find the request in CloudWatch. */
  readonly requestId?: string;
  /** Field errors parsed from a FastAPI 422 response. */
  readonly fieldErrors?: Readonly<Record<string, string[]>>;
  /** Seconds, from Retry-After on 429/503. */
  readonly retryAfter?: number;
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'kind' in value && 'message' in value;
}

/** The thrown form of ApiError, so TanStack Query and try/catch receive a real Error. */
export class ApiRequestError extends Error implements ApiError {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly requestId?: string;
  readonly fieldErrors?: Readonly<Record<string, string[]>>;
  readonly retryAfter?: number;

  constructor(init: ApiError, options?: { cause?: unknown }) {
    super(init.message, options);
    this.name = 'ApiRequestError';
    this.kind = init.kind;
    this.status = init.status;
    this.requestId = init.requestId;
    this.fieldErrors = init.fieldErrors;
    this.retryAfter = init.retryAfter;
  }
}

export const REQUEST_ID_HEADER = 'x-request-id';

const FALLBACK_MESSAGES: Record<ApiErrorKind, string> = {
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You don’t have permission to do this.',
  not_found: 'The requested item could not be found.',
  conflict: 'This item was changed by someone else. Refresh and try again.',
  validation: 'Some of the information provided is not valid.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
  timeout: 'The request took too long. Please try again.',
  network: 'We couldn’t reach Radial Pulse. Check your connection and try again.',
  server: 'Something went wrong on our side. Please try again.',
};

export function kindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status === 408 || status === 504) return 'timeout';
  return 'server';
}

/** Retry-After as seconds: delta-seconds or an HTTP date. */
export function parseRetryAfter(value: string | null, now = Date.now()): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, Math.ceil((at - now) / 1000));
}

interface FastApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

const LOCATION_PREFIXES = new Set(['body', 'query', 'path', 'header', 'cookie']);

/** FastAPI `{ detail: [{ loc: ['body', 'email'], msg }] }` → `{ email: [msg] }`. */
export function parseFieldErrors(detail: unknown): Record<string, string[]> | undefined {
  if (!Array.isArray(detail)) return undefined;
  const out: Record<string, string[]> = {};
  for (const item of detail as FastApiValidationItem[]) {
    if (!item || typeof item.msg !== 'string' || !Array.isArray(item.loc)) continue;
    const path = item.loc.filter((part, i) => !(i === 0 && LOCATION_PREFIXES.has(String(part))));
    const key = path.join('.') || '_';
    (out[key] ??= []).push(item.msg);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** A server-provided message: FastAPI `detail` string or API Gateway `message`. */
function serverMessage(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body.trim();
  if (typeof body !== 'object' || body === null) return undefined;
  const { detail, message } = body as { detail?: unknown; message?: unknown };
  if (typeof detail === 'string') return detail;
  if (typeof message === 'string') return message;
  return undefined;
}

export function errorFromResponse(response: Response, body: unknown): ApiRequestError {
  const kind = kindForStatus(response.status);
  const detail =
    typeof body === 'object' && body !== null ? (body as { detail?: unknown }).detail : undefined;
  return new ApiRequestError({
    kind,
    status: response.status,
    message: serverMessage(body) ?? FALLBACK_MESSAGES[kind],
    requestId: response.headers.get(REQUEST_ID_HEADER) ?? undefined,
    fieldErrors: parseFieldErrors(detail),
    retryAfter: parseRetryAfter(response.headers.get('retry-after')),
  });
}

export function networkError(requestId: string | undefined, cause: unknown): ApiRequestError {
  return new ApiRequestError(
    { kind: 'network', message: FALLBACK_MESSAGES.network, requestId },
    { cause },
  );
}

export function timeoutError(requestId: string | undefined): ApiRequestError {
  return new ApiRequestError({ kind: 'timeout', message: FALLBACK_MESSAGES.timeout, requestId });
}

/**
 * Whether repeating the same request may succeed: transient transport and
 * capacity failures only. Client errors (4xx other than 408/429) never retry.
 */
export function isRetryable(error: unknown): boolean {
  if (!isApiError(error)) return false;
  switch (error.kind) {
    case 'network':
    case 'timeout':
    case 'rate_limited':
      return true;
    case 'server':
      return error.status === undefined || error.status >= 500;
    default:
      return false;
  }
}
