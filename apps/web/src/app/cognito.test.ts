// @vitest-environment jsdom
import { CognitoAuthError, type CognitoAuthProvider } from '@radial-pulse/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authErrorMessage, completeWebSignIn, safeReturnPath } from './cognito';

function provider(complete: () => Promise<void>): CognitoAuthProvider {
  return {
    method: 'cognito',
    signInOptions: [],
    getAccessToken: async () => null,
    signIn: async () => {},
    signOut: async () => {},
    completeSignIn: vi.fn(complete),
  };
}

afterEach(() => sessionStorage.clear());

describe('web Cognito callback', () => {
  it('accepts only same-origin app paths as the place to return to', () => {
    expect(safeReturnPath('/clinics/c1/media')).toBe('/clinics/c1/media');
    expect(safeReturnPath('https://evil.example')).toBeUndefined();
    expect(safeReturnPath('//evil.example')).toBeUndefined();
    expect(safeReturnPath('/sign-in')).toBeUndefined();
    expect(safeReturnPath('/auth/callback?code=x')).toBeUndefined();
  });

  it('returns to the page the user wanted after a successful exchange', async () => {
    sessionStorage.setItem('rp.auth.return', '/clinics');
    const auth = provider(async () => {});
    expect(await completeWebSignIn(auth)).toBe('/clinics');
    expect(auth.completeSignIn).toHaveBeenCalledWith(window.location.href);
    expect(sessionStorage.getItem('rp.auth.return')).toBeNull();
  });

  it('goes to the dashboard when no destination was kept', async () => {
    expect(await completeWebSignIn(provider(async () => {}))).toBe('/dashboard');
  });

  it('sends a failed sign-in back to sign-in with a reason', async () => {
    const denied = provider(async () => {
      throw new CognitoAuthError('access_denied', 'cancelled');
    });
    expect(await completeWebSignIn(denied)).toBe('/sign-in?auth_error=access_denied');
    const broken = provider(async () => {
      throw new Error('network');
    });
    expect(await completeWebSignIn(broken)).toBe('/sign-in?auth_error=sign_in_failed');
    expect(authErrorMessage('access_denied')).toBe('Sign-in was cancelled.');
    expect(authErrorMessage('anything')).toMatch(/didn’t complete/);
  });
});
