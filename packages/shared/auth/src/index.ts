/**
 * @radial-pulse/auth — the session boundary (ADR 0008), framework-free:
 * sign-in providers (Cognito Managed Login with PKCE, mock personas, unconfigured),
 * the session controller built from `GET /api/v1/auth/me`, product experience and
 * the composition root that wires the API client to the session. No React.
 */
export type {
  ClinicPermissions,
  ClinicSummary,
  CurrentUser,
  Session,
  SessionAdapter,
  SessionController,
  SessionState,
  SignInOption,
} from './session';
export { createSessionController, sessionFromMe } from './session';
export { createMockAuth, SignInUnavailableError, unconfiguredAuth } from './auth-provider';
export type { AuthProvider, SignInMethod, TokenStorage } from './auth-provider';
export { base64Url, CognitoAuthError, createCognitoAuth } from './cognito-auth';
export type {
  AuthStorage,
  CognitoAuthProvider,
  CognitoPlatform,
  CognitoSettings,
} from './cognito-auth';
export { createApiSessionAdapter } from './api-session';
export { createAppServices } from './app-services';
export type { AppServices } from './app-services';
export { roleLabel } from './roles';
export { clinicAdministratorClinicIds, productExperience } from './experience';
export type { ProductExperience } from './experience';
