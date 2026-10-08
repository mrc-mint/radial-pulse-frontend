import type { AppConfig } from '@radial-pulse/config';
import {
  CognitoAuthError,
  createCognitoAuth,
  type CognitoAuthProvider,
} from '@radial-pulse/platform-shell/core';

/**
 * Cognito Managed Login for Studio (Authorization Code + PKCE, ADR
 * 0006). Tokens live in sessionStorage: tab-scoped, survive a reload, gone
 * when the tab closes. The page leaves for Managed Login and comes back to
 * AUTH_CALLBACK_PATH, which boot completes before the app mounts.
 */

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const SIGN_IN_PATH = '/sign-in';
/** Where to go after sign-in (the sign-in page's `redirect`), across the redirect. */
const RETURN_KEY = 'rp.auth.return';

/** Only same-origin app paths (never sign-in or the callback) are accepted. */
export function safeReturnPath(value: unknown): string | undefined {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith(SIGN_IN_PATH) &&
    !value.startsWith(AUTH_CALLBACK_PATH)
    ? value
    : undefined;
}

export function createWebCognitoAuth(config: AppConfig): CognitoAuthProvider {
  const origin = window.location.origin;
  return createCognitoAuth(
    {
      domain: config.cognito.domain,
      clientId: config.cognito.userPoolClientId,
      redirectUri: `${origin}${AUTH_CALLBACK_PATH}`,
      logoutUri: `${origin}${SIGN_IN_PATH}`,
      scopes: config.cognito.scopes,
    },
    {
      storage: window.sessionStorage,
      randomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
      sha256: async (data) =>
        new Uint8Array(await crypto.subtle.digest('SHA-256', data as Uint8Array<ArrayBuffer>)),
      authorize: (url) => {
        const redirect = safeReturnPath(
          new URLSearchParams(window.location.search).get('redirect'),
        );
        if (redirect) sessionStorage.setItem(RETURN_KEY, redirect);
        else sessionStorage.removeItem(RETURN_KEY);
        window.location.assign(url);
        // The page is leaving; sign-in finishes on the callback page.
        return new Promise<never>(() => {});
      },
      logout: async (url) => {
        window.location.assign(url);
      },
    },
  );
}

/**
 * Completes sign-in on the callback page and returns where to go next: the
 * page the user wanted, or sign-in with an `auth_error` code to explain.
 */
export async function completeWebSignIn(auth: CognitoAuthProvider): Promise<string> {
  const back = safeReturnPath(sessionStorage.getItem(RETURN_KEY)) ?? '/dashboard';
  sessionStorage.removeItem(RETURN_KEY);
  try {
    await auth.completeSignIn(window.location.href);
    return back;
  } catch (error) {
    const code = error instanceof CognitoAuthError ? error.code : 'sign_in_failed';
    return `${SIGN_IN_PATH}?auth_error=${encodeURIComponent(code)}`;
  }
}

/** What to tell the user when Managed Login sent them back without signing in. */
export function authErrorMessage(code: string): string {
  switch (code) {
    case 'access_denied':
      return 'Sign-in was cancelled.';
    case 'invalid_state':
      return 'That sign-in link has expired. Please sign in again.';
    case 'invalid_grant':
      return 'That sign-in attempt has expired. Please sign in again.';
    default:
      return 'Sign-in didn’t complete. Please try again.';
  }
}
