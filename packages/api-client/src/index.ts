/**
 * @radial-pulse/api-client — root entry: transport + resource services.
 *
 * PHASE 2 STUB. Phase 4 adds:
 *   - http.ts: openapi-fetch client typed by the generated contract, base URL
 *     from AppConfig.apiBaseUrl (the API Gateway domain), injected
 *     getAccessToken()/onUnauthorized(), x-request-id on every request
 *   - services/: one module per resource
 *
 * Components never call fetch directly; they use hooks from ./react.
 */
export type { ApiError, ApiErrorKind } from './errors';
export { isApiError } from './errors';
export type { AuthBridge } from './auth-bridge';
