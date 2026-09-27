/**
 * @radial-pulse/api-client — root entry: transport and error model.
 *
 * The only way the frontend talks to the platform API (via API Gateway).
 * Components never call fetch directly; they use hooks from ./react.
 *
 * Phase 4 status: transport, error normalization, request ids, auth
 * injection and query infrastructure are in place. `services/` (one module
 * per contract resource) and the resource hooks are blocked on the first
 * published API contract — see docs/phase-4-contract-dependency.md.
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
