import type { Schema } from '@radial-pulse/shared-types';

/**
 * Every failure is normalized into one ApiError, whether it came from
 * API Gateway (authorizer 401/403, throttling 429, integration timeout 504)
 * or from the platform API, whose only error shape is RFC 9457
 * `application/problem+json` (contract `ProblemDetails`). See architecture §7.
 *
 * Contract status meanings (openapi CHANGELOG v0.1.0): 404 = not found OR no
 * access to that clinic, 403 = not allowed, 409 = wrong state, 422 = invalid
 * input, 502 = another platform refused, 503 = not set up yet.
 */
export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'rate_limited'
  | 'timeout'
  | 'upstream'
  | 'unavailable'
  | 'network'
  | 'server';

export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly message: string;
  /** Machine-readable problem type from the API (e.g. `not_provisioned`). */
  readonly code?: string;
  /** Echo of x-request-id so support can find the request in CloudWatch. */
  readonly requestId?: string;
  /** Field errors from `ProblemDetails.errors` (422). Keys are dotted field paths. */
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
  readonly code?: string;
  readonly requestId?: string;
  readonly fieldErrors?: Readonly<Record<string, string[]>>;
  readonly retryAfter?: number;

  constructor(init: ApiError, options?: { cause?: unknown }) {
    super(init.message, options);
    this.name = 'ApiRequestError';
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.requestId = init.requestId;
    this.fieldErrors = init.fieldErrors;
    this.retryAfter = init.retryAfter;
  }
}

export const REQUEST_ID_HEADER = 'x-request-id';

const FALLBACK_MESSAGES: Record<ApiErrorKind, string> = {
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You don’t have permission to do this.',
  not_found: 'This item doesn’t exist or you don’t have access to it.',
  conflict: 'This can’t be done in its current state. Refresh and try again.',
  validation: 'Some of the information provided is not valid.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
  timeout: 'The request took too long. Please try again.',
  upstream: 'A connected platform refused the request. Please try again later.',
  unavailable: 'This feature isn’t set up yet.',
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
  if (status === 502) return 'upstream';
  if (status === 503) return 'unavailable';
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

const LOCATION_PREFIXES = new Set(['body', 'query', 'path', 'header', 'cookie']);

/** `ProblemDetails.errors` (`[{ loc: ['body', 'email'], msg }]`) → `{ email: [msg] }`. */
export function parseFieldErrors(
  issues: ReadonlyArray<Schema<'ValidationIssue'>> | null | undefined,
): Record<string, string[]> | undefined {
  if (!Array.isArray(issues)) return undefined;
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    if (!issue || typeof issue.msg !== 'string' || !Array.isArray(issue.loc)) continue;
    const path = issue.loc.filter(
      (part: string | number, i: number) => !(i === 0 && LOCATION_PREFIXES.has(String(part))),
    );
    const key = path.join('.') || '_';
    (out[key] ??= []).push(issue.msg);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

type Problem = Partial<Schema<'ProblemDetails'>> & { message?: unknown };

function asProblem(body: unknown): Problem {
  return typeof body === 'object' && body !== null ? (body as Problem) : {};
}

/**
 * A readable message: the problem `detail`, else its `title`, else API
 * Gateway's `message` (its own 401/403/429/504 bodies are not problem+json).
 */
function serverMessage(problem: Problem, body: unknown): string | undefined {
  if (typeof problem.detail === 'string' && problem.detail) return problem.detail;
  if (typeof problem.title === 'string' && problem.title) return problem.title;
  if (typeof problem.message === 'string' && problem.message) return problem.message;
  if (typeof body === 'string' && body.trim()) return body.trim();
  return undefined;
}

export function errorFromResponse(response: Response, body: unknown): ApiRequestError {
  const kind = kindForStatus(response.status);
  const problem = asProblem(body);
  return new ApiRequestError({
    kind,
    status: response.status,
    message: serverMessage(problem, body) ?? FALLBACK_MESSAGES[kind],
    code: typeof problem.type === 'string' ? problem.type : undefined,
    requestId:
      response.headers.get(REQUEST_ID_HEADER) ||
      (typeof problem.request_id === 'string' ? problem.request_id : undefined),
    fieldErrors: parseFieldErrors(problem.errors),
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
 * capacity failures only. Client errors, `upstream` (another platform said
 * no) and `unavailable` (not set up) never retry.
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
