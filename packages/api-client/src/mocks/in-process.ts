import { getResponse } from 'msw';
import { createMockHandlers, type MockOptions } from './handlers';

/**
 * The contract mocks as a `fetch` for the API client, without a service
 * worker or request interception: for React Native, where neither exists.
 * Each request is offered to the handlers first; unmatched requests go to
 * the network (`fallback`).
 */
export function createMockFetch(
  options: MockOptions,
  fallback: (request: Request) => Promise<Response> = (request) => globalThis.fetch(request),
): (request: Request) => Promise<Response> {
  const handlers = createMockHandlers(options);
  return async (request) => (await getResponse(handlers, request.clone())) ?? fallback(request);
}
