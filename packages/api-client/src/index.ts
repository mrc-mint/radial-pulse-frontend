/**
 * @radial-pulse/api-client — root entry: transport and error model.
 *
 * The only way the frontend talks to the platform API (via API Gateway).
 * Components never call fetch directly; they use hooks from ./react.
 *
 * Services (./services) wrap each contract operation used by the screens;
 * resource hooks live in ./react. All types come from the generated contract.
 */
export type { ApiError, ApiErrorKind } from './errors';
export {
  ApiRequestError,
  errorFromResponse,
  isApiError,
  isRetryable,
  kindForStatus,
  parseFieldErrors,
  parseRetryAfter,
  REQUEST_ID_HEADER,
} from './errors';
export type { AuthBridge } from './auth-bridge';
export type { ApiClient, ApiClientOptions } from './http';
export { createApiClient, DEFAULT_TIMEOUT_MS, platformMiddleware, unwrap } from './http';
export { createRequestId } from './request-id';
export * from './services';
