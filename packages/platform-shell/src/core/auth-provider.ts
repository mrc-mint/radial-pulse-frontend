import type { AppConfig } from '@radial-pulse/config';
import type { SignInOption } from './session';

/**
 * How an app obtains an access token (web and mobile):
 *   - `createCognitoAuth` — Cognito Managed Login, Authorization Code + PKCE
 *                         (./cognito-auth.ts).
 *   - `createMockAuth`  — only with API mocking: persona tokens the MSW
 *                         `/auth/me` understands. Never real credentials.
 *   - `unconfiguredAuth` — no sign-in available, matching the backend's
 *                         "auth not configured" mode.
 */
/** How users sign in: Cognito Managed Login, mock personas (API mocking only), or not at all. */
export type SignInMethod = 'cognito' | 'mock' | 'none';

export interface AuthProvider {
  readonly method: SignInMethod;
  readonly signInOptions: ReadonlyArray<SignInOption>;
  getAccessToken(): Promise<string | null>;
  signIn(optionId?: string): Promise<void>;
  signOut(): Promise<void>;
}

export class SignInUnavailableError extends Error {
  constructor() {
    super('Sign-in is not configured for this environment yet.');
    this.name = 'SignInUnavailableError';
  }
}

export const unconfiguredAuth: AuthProvider = {
  method: 'none',
  signInOptions: [],
  getAccessToken: async () => null,
  signIn: async () => {
    throw new SignInUnavailableError();
  },
  signOut: async () => {},
};

export interface TokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = 'rp.mock-auth.token';

/** The browser's sessionStorage where there is one (web); otherwise memory only. */
function defaultStorage(): TokenStorage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/**
 * MOCK-ONLY sign-in: the chosen persona becomes a `dev-persona:<id>` token,
 * which only the MSW mocks accept. Refused unless API mocking is on (and
 * createConfig() already refuses mocking in prod).
 */
export function createMockAuth(
  config: Pick<AppConfig, 'appEnv' | 'apiMocking'>,
  personas: ReadonlyArray<{ id: string; label: string; description: string }>,
  tokenPrefix: string,
  storage: TokenStorage | null = defaultStorage(),
): AuthProvider {
  if (!config.apiMocking || config.appEnv === 'prod') {
    throw new Error('Mock sign-in is only available with API mocking outside prod.');
  }
  let memory: string | null = null;
  const read = () => {
    try {
      return storage?.getItem(STORAGE_KEY) ?? memory;
    } catch {
      return memory;
    }
  };
  const write = (token: string | null) => {
    memory = token;
    try {
      if (token) storage?.setItem(STORAGE_KEY, token);
      else storage?.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: the session lasts until reload.
    }
  };
  return {
    method: 'mock',
    signInOptions: personas.map(({ id, label, description }) => ({ id, label, description })),
    getAccessToken: async () => read(),
    signIn: async (optionId) => {
      const persona = personas.find((p) => p.id === optionId) ?? personas[0];
      if (!persona) throw new SignInUnavailableError();
      write(`${tokenPrefix}${persona.id}`);
    },
    signOut: async () => write(null),
  };
}
