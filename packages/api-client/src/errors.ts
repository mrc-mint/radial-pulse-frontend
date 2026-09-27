/**
 * Every failure is normalized into one ApiError, whether it came from
 * API Gateway (authorizer 401/403, throttling 429, integration timeout 504)
 * or from FastAPI (including 422 validation detail). See architecture §7.
 */
export type ApiErrorKind =
  'unauthorized' | 'forbidden' | 'not_found' | 'validation' | 'rate_limited' | 'network' | 'server';

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
