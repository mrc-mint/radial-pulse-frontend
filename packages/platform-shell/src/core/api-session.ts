import { authService, isApiError, type ApiClient } from '@radial-pulse/api-client';
import type { AuthProvider } from './auth-provider';
import { sessionFromMe, type SessionAdapter } from './session';

/**
 * The session always comes from the contract's `GET /api/v1/auth/me`,
 * whichever provider issued the token. No token or a 401 means signed out.
 */
export function createApiSessionAdapter(auth: AuthProvider, api: ApiClient): SessionAdapter {
  async function restore() {
    if (!(await auth.getAccessToken())) return null;
    try {
      return sessionFromMe(await authService.me(api));
    } catch (error) {
      if (isApiError(error) && error.kind === 'unauthorized') {
        await auth.signOut();
        return null;
      }
      throw error;
    }
  }

  return {
    signInMethod: auth.method,
    signInOptions: auth.signInOptions,
    restore,
    async signIn(optionId) {
      await auth.signIn(optionId);
      return restore();
    },
    signOut: () => auth.signOut(),
    getAccessToken: () => auth.getAccessToken(),
  };
}
