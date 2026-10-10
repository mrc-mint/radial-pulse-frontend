import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  isApiError,
  isRetryable,
  kindForStatus,
  parseFieldErrors,
  parseRetryAfter,
} from './errors';
import { createRequestId } from './request-id';

const error = (init: ConstructorParameters<typeof ApiRequestError>[0]) => new ApiRequestError(init);

describe('kindForStatus', () => {
  it.each([
    [400, 'validation'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'conflict'],
    [422, 'validation'],
    [429, 'rate_limited'],
    [500, 'server'],
    [502, 'upstream'],
    [503, 'unavailable'],
    [504, 'timeout'],
  ])('%i → %s', (status, kind) => expect(kindForStatus(status)).toBe(kind));
});

describe('parseRetryAfter', () => {
  it('reads seconds and HTTP dates', () => {
    expect(parseRetryAfter('12')).toBe(12);
    const now = Date.parse('2026-09-27T10:00:00Z');
    expect(parseRetryAfter('Sun, 27 Sep 2026 10:00:30 GMT', now)).toBe(30);
    expect(parseRetryAfter('soon')).toBeUndefined();
    expect(parseRetryAfter(null)).toBeUndefined();
  });
});

describe('parseFieldErrors', () => {
  it('ignores missing lists and malformed issues', () => {
    expect(parseFieldErrors(null)).toBeUndefined();
    expect(parseFieldErrors([{ loc: 'x', msg: 'no list', type: 't' } as never])).toBeUndefined();
    expect(parseFieldErrors([{ loc: ['query', 'limit'], msg: 'too big', type: 't' }])).toEqual({
      limit: ['too big'],
    });
  });
});

describe('ApiRequestError', () => {
  it('is both an Error and an ApiError', () => {
    const e = error({ kind: 'forbidden', message: 'No', status: 403 });
    expect(e).toBeInstanceOf(Error);
    expect(isApiError(e)).toBe(true);
  });
});

describe('retry policy', () => {
  it('retries only transient failures', () => {
    expect(isRetryable(error({ kind: 'network', message: '' }))).toBe(true);
    expect(isRetryable(error({ kind: 'timeout', message: '' }))).toBe(true);
    expect(isRetryable(error({ kind: 'rate_limited', message: '' }))).toBe(true);
    expect(isRetryable(error({ kind: 'server', message: '', status: 500 }))).toBe(true);
    expect(isRetryable(error({ kind: 'upstream', message: '', status: 502 }))).toBe(false);
    expect(isRetryable(error({ kind: 'unavailable', message: '', status: 503 }))).toBe(false);
    for (const kind of [
      'unauthorized',
      'forbidden',
      'not_found',
      'validation',
      'conflict',
    ] as const) {
      expect(isRetryable(error({ kind, message: '' }))).toBe(false);
    }
    expect(isRetryable(new Error('not an api error'))).toBe(false);
  });
});

describe('createRequestId', () => {
  const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it('produces a v4 UUID', () => expect(createRequestId()).toMatch(V4));

  it('works without crypto.randomUUID (React Native / Hermes)', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      expect(createRequestId()).toMatch(V4);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });
});
