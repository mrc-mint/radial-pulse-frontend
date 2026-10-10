import { ApiRequestError } from '@radial-pulse/api-client';
import { describe, expect, it } from 'vitest';
import { createQueryClient, retryDelay, shouldRetry } from './query-client';

const error = (init: ConstructorParameters<typeof ApiRequestError>[0]) => new ApiRequestError(init);

describe('React Query retry policy', () => {
  it('caps query retries', () => {
    const transient = error({ kind: 'network', message: '' });
    expect(shouldRetry(0, transient)).toBe(true);
    expect(shouldRetry(2, transient)).toBe(false);
  });

  it('honours Retry-After, otherwise backs off exponentially', () => {
    expect(retryDelay(0, error({ kind: 'rate_limited', message: '', retryAfter: 5 }))).toBe(5000);
    expect(retryDelay(1, error({ kind: 'network', message: '' }))).toBe(2000);
    expect(retryDelay(10, error({ kind: 'network', message: '' }))).toBe(8000);
  });

  it('never retries mutations by default', () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});
