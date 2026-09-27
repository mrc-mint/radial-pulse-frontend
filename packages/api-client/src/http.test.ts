import { describe, expect, it, vi } from 'vitest';
import type { AuthBridge } from './auth-bridge';
import { ApiRequestError, isApiError } from './errors';
import { createApiClient, unwrap } from './http';

/**
 * Test-only paths in the shape openapi-typescript generates. Deliberately
 * domain-free: real paths come from the published contract.
 */
interface TestPaths {
  '/test/resource/{id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: {
      parameters: { query?: never; header?: never; path: { id: string }; cookie?: never };
      requestBody?: never;
      responses: {
        200: { headers: Record<string, unknown>; content: { 'application/json': { id: string } } };
        default: { headers: Record<string, unknown>; content: { 'application/json': unknown } };
      };
    };
  };
}

type Responder = (request: Request, init?: RequestInit) => Promise<Response>;

function setup(respond: Responder, token: string | null = 'token-abc', timeoutMs?: number) {
  const requests: Request[] = [];
  const auth: AuthBridge = {
    getAccessToken: vi.fn(async () => token),
    onUnauthorized: vi.fn(),
  };
  const client = createApiClient<TestPaths>({
    baseUrl: 'https://api.dev.radialpulse.example/',
    auth,
    timeoutMs,
    createRequestId: () => 'req-123',
    fetch: (request, init) => {
      requests.push(request);
      return respond(request, init);
    },
  });
  const get = (id = 'r1', signal?: AbortSignal) =>
    unwrap(client.GET('/test/resource/{id}', { params: { path: { id } }, signal }));
  return { auth, requests, get };
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

async function failure(promise: Promise<unknown>): Promise<ApiRequestError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiRequestError) return error;
    throw error;
  }
  throw new Error('expected the request to fail');
}

describe('createApiClient', () => {
  it('returns data and sends the request id and bearer token', async () => {
    const { get, requests } = setup(async () => json(200, { id: 'r1' }));
    await expect(get()).resolves.toEqual({ id: 'r1' });
    const [request] = requests;
    expect(request?.url).toBe('https://api.dev.radialpulse.example/test/resource/r1');
    expect(request?.headers.get('x-request-id')).toBe('req-123');
    expect(request?.headers.get('authorization')).toBe('Bearer token-abc');
  });

  it('sends no authorization header without a token', async () => {
    const { get, requests } = setup(async () => json(200, { id: 'r1' }), null);
    await get();
    expect(requests[0]?.headers.has('authorization')).toBe(false);
  });

  it('signals the session on 401 and quotes the request id', async () => {
    const { get, auth } = setup(async () => json(401, { message: 'Unauthorized' }));
    const error = await failure(get());
    expect(error.kind).toBe('unauthorized');
    expect(error.requestId).toBe('req-123');
    expect(auth.onUnauthorized).toHaveBeenCalledOnce();
  });

  it('maps a gateway 403 to forbidden without signing out', async () => {
    const { get, auth } = setup(async () => json(403, { message: 'Forbidden' }));
    expect((await failure(get())).kind).toBe('forbidden');
    expect(auth.onUnauthorized).not.toHaveBeenCalled();
  });

  it('parses FastAPI 422 field errors', async () => {
    const { get } = setup(async () =>
      json(422, {
        detail: [
          {
            loc: ['body', 'email'],
            msg: 'value is not a valid email address',
            type: 'value_error',
          },
          { loc: ['body', 'contacts', 0, 'phone'], msg: 'field required', type: 'missing' },
        ],
      }),
    );
    const error = await failure(get());
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({
      email: ['value is not a valid email address'],
      'contacts.0.phone': ['field required'],
    });
  });

  it('reads Retry-After on throttling', async () => {
    const { get } = setup(async () =>
      json(429, { message: 'Too Many Requests' }, { 'retry-after': '7' }),
    );
    const error = await failure(get());
    expect(error.kind).toBe('rate_limited');
    expect(error.retryAfter).toBe(7);
  });

  it('maps an API Gateway integration timeout', async () => {
    const { get } = setup(async () => json(504, { message: 'Endpoint request timed out' }));
    const error = await failure(get());
    expect(error.kind).toBe('timeout');
    expect(error.status).toBe(504);
  });

  it('keeps the server request id when the backend echoes one', async () => {
    const { get } = setup(async () => json(500, { detail: 'boom' }, { 'x-request-id': 'srv-9' }));
    const error = await failure(get());
    expect(error.requestId).toBe('srv-9');
    expect(error.message).toBe('boom');
  });

  it('normalizes network failures', async () => {
    const { get } = setup(async () => {
      throw new TypeError('Failed to fetch');
    });
    const error = await failure(get());
    expect(error.kind).toBe('network');
    expect(error.requestId).toBe('req-123');
  });

  it('times out slow requests', async () => {
    const { get } = setup(
      (_request, init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
      'token',
      20,
    );
    expect((await failure(get())).kind).toBe('timeout');
  });

  it('lets caller cancellation through as an abort, not an API error', async () => {
    const controller = new AbortController();
    const { get } = setup((_request, init) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    });
    const pending = get('r1', controller.signal);
    controller.abort();
    const error = await pending.catch((e: unknown) => e);
    expect(isApiError(error)).toBe(false);
    expect((error as Error).name).toBe('AbortError');
  });
});
