import { QueryClient } from '@tanstack/react-query';
import { isApiError, isRetryable } from '../errors';

/** Attempts after the first failure, for retryable errors only. */
export const MAX_RETRIES = 2;
const MAX_DELAY_MS = 8_000;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_RETRIES && isRetryable(error);
}

/** Honours Retry-After (429/503); otherwise exponential backoff capped at 8s. */
export function retryDelay(attempt: number, error: unknown): number {
  if (isApiError(error) && error.retryAfter !== undefined) return error.retryAfter * 1000;
  return Math.min(1000 * 2 ** attempt, MAX_DELAY_MS);
}

/**
 * The QueryClient every app uses. Queries retry only transient failures;
 * mutations never retry automatically (they may not be idempotent).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay,
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
