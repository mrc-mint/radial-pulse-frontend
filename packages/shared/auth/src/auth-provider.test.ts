import { describe, expect, it } from 'vitest';
import { createMockAuth, SignInUnavailableError, unconfiguredAuth } from './auth-provider';

const personas = [{ id: 'clinic-administrator', label: 'Clinic Administrator', description: '' }];

describe('createMockAuth', () => {
  it('is refused without API mocking and in prod', () => {
    expect(() => createMockAuth({ appEnv: 'local', apiMocking: false }, personas, 'p:')).toThrow();
    expect(() => createMockAuth({ appEnv: 'prod', apiMocking: true }, personas, 'p:')).toThrow();
  });

  it('issues a persona token the mocks understand, and forgets it on sign-out', async () => {
    const auth = createMockAuth({ appEnv: 'local', apiMocking: true }, personas, 'p:', null);
    await auth.signIn('clinic-administrator');
    expect(await auth.getAccessToken()).toBe('p:clinic-administrator');
    await auth.signOut();
    expect(await auth.getAccessToken()).toBeNull();
  });
});

describe('unconfiguredAuth', () => {
  it('offers no sign-in', async () => {
    expect(unconfiguredAuth.signInOptions).toEqual([]);
    await expect(unconfiguredAuth.signIn()).rejects.toBeInstanceOf(SignInUnavailableError);
  });
});
