import type { AuthProvider } from './auth-provider';

/**
 * Cognito Managed Login with the OAuth 2.0 Authorization Code grant and PKCE
 * (ADR 0006), for web and mobile. A public app client: no client secret ever
 * reaches the app. The user signs in with email and password on Cognito's own
 * page; the app only exchanges the returned code for tokens and sends the
 * access token to the API (`Authorization: Bearer …`).
 *
 * Endpoints (Cognito user pool domain): /oauth2/authorize, /oauth2/token,
 * /oauth2/revoke and /logout. Service-to-service (client-credentials) tokens
 * are a backend concern and never handled here.
 *
 * Each app supplies the platform parts: token storage, crypto and how the
 * browser is opened.
 */

export interface CognitoSettings {
  /** Managed Login domain, e.g. `auth.dev.example.com` (a scheme is ignored). */
  domain: string;
  /** Public app client id (no secret). */
  clientId: string;
  /** This app's callback, registered on the app client. */
  redirectUri: string;
  /** Where Cognito returns after sign-out, registered on the app client. */
  logoutUri: string;
  /** OAuth scopes the app client allows. */
  scopes: ReadonlyArray<string>;
}

/** Async key-value storage (sessionStorage on web, the secure store on mobile). */
export interface AuthStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export interface CognitoPlatform {
  storage: AuthStorage;
  randomBytes(length: number): Uint8Array | Promise<Uint8Array>;
  sha256(data: Uint8Array): Promise<Uint8Array>;
  /**
   * Opens Managed Login. Returns the callback URL when the platform receives
   * it in place (mobile auth session), null when the page navigates away and
   * the callback arrives on a new page load (web), and throws on cancel.
   */
  authorize(url: string, redirectUri: string): Promise<string | null>;
  /** Ends the Managed Login session (navigate on web, auth session on mobile). */
  logout(url: string, logoutUri: string): Promise<void>;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
  now?: () => number;
}

export interface CognitoAuthProvider extends AuthProvider {
  /** Finishes sign-in from the callback URL (`?code=…&state=…`). */
  completeSignIn(callbackUrl: string): Promise<void>;
}

/** A sign-in that did not complete: cancelled, denied, or the exchange failed. */
export class CognitoAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CognitoAuthError';
  }
}

interface Tokens {
  accessToken: string;
  refreshToken: string | null;
  /** Epoch milliseconds. */
  expiresAt: number;
}

const TOKENS_KEY = 'rp.auth.tokens';
const PENDING_KEY = 'rp.auth.pending';
/** Refresh this long before the access token expires. */
const EXPIRY_SKEW_MS = 60_000;

const BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Unpadded base64url (RFC 4648 §5), without relying on btoa. */
export function base64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b = 0, c = 0] = [bytes[i]!, bytes[i + 1], bytes[i + 2]];
    const n = (a << 16) | (b << 8) | c;
    out += BASE64URL[(n >> 18) & 63]! + BASE64URL[(n >> 12) & 63]!;
    if (i + 1 < bytes.length) out += BASE64URL[(n >> 6) & 63]!;
    if (i + 2 < bytes.length) out += BASE64URL[n & 63]!;
  }
  return out;
}

const domainUrl = (domain: string) =>
  `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;

const form = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

export function createCognitoAuth(
  settings: CognitoSettings,
  platform: CognitoPlatform,
): CognitoAuthProvider {
  const base = domainUrl(settings.domain);
  const fetchImpl = platform.fetch ?? ((url, init) => globalThis.fetch(url, init));
  const now = platform.now ?? (() => Date.now());
  let cached: Tokens | null | undefined;
  let refreshing: Promise<Tokens | null> | null = null;

  async function readTokens(): Promise<Tokens | null> {
    if (cached !== undefined) return cached;
    try {
      const raw = await platform.storage.getItem(TOKENS_KEY);
      cached = raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      cached = null;
    }
    return cached;
  }

  async function writeTokens(tokens: Tokens | null) {
    cached = tokens;
    if (tokens) await platform.storage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    else await platform.storage.removeItem(TOKENS_KEY);
  }

  async function tokenRequest(body: Record<string, string>): Promise<Tokens> {
    const response = await fetchImpl(`${base}/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form({ client_id: settings.clientId, ...body }),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok || typeof data.access_token !== 'string') {
      throw new CognitoAuthError(
        typeof data.error === 'string' ? data.error : 'token_request_failed',
        'Cognito did not issue tokens.',
      );
    }
    return {
      accessToken: data.access_token,
      refreshToken: typeof data.refresh_token === 'string' ? data.refresh_token : null,
      expiresAt: now() + Number(data.expires_in ?? 3600) * 1000,
    };
  }

  async function refresh(tokens: Tokens): Promise<Tokens | null> {
    if (!tokens.refreshToken) return null;
    try {
      const next = await tokenRequest({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      });
      // Cognito keeps the same refresh token unless rotation is on.
      return { ...next, refreshToken: next.refreshToken ?? tokens.refreshToken };
    } catch {
      return null;
    }
  }

  const provider: CognitoAuthProvider = {
    method: 'cognito',
    signInOptions: [
      { id: 'cognito', label: 'Sign in with email', description: 'Email and password' },
    ],

    async getAccessToken() {
      const tokens = await readTokens();
      if (!tokens) return null;
      if (now() < tokens.expiresAt - EXPIRY_SKEW_MS) return tokens.accessToken;
      // One refresh at a time; concurrent requests share it.
      refreshing ??= refresh(tokens).finally(() => {
        refreshing = null;
      });
      const next = await refreshing;
      await writeTokens(next);
      return next?.accessToken ?? null;
    },

    async signIn() {
      const verifier = base64Url(await platform.randomBytes(48));
      const state = base64Url(await platform.randomBytes(24));
      const challenge = base64Url(await platform.sha256(new TextEncoder().encode(verifier)));
      await platform.storage.setItem(PENDING_KEY, JSON.stringify({ state, verifier }));
      const url =
        `${base}/oauth2/authorize?` +
        form({
          response_type: 'code',
          client_id: settings.clientId,
          redirect_uri: settings.redirectUri,
          scope: settings.scopes.join(' '),
          state,
          code_challenge: challenge,
          code_challenge_method: 'S256',
          // Email and password in the user pool only: no social providers.
          identity_provider: 'COGNITO',
        });
      const callback = await platform.authorize(url, settings.redirectUri);
      if (callback) await provider.completeSignIn(callback);
    },

    async completeSignIn(callbackUrl) {
      const params = new URL(callbackUrl).searchParams;
      const pendingRaw = await platform.storage.getItem(PENDING_KEY);
      await platform.storage.removeItem(PENDING_KEY);
      const error = params.get('error');
      if (error) {
        throw new CognitoAuthError(
          error,
          params.get('error_description') ?? 'Sign-in was not completed.',
        );
      }
      const pending = pendingRaw
        ? (JSON.parse(pendingRaw) as { state: string; verifier: string })
        : null;
      const code = params.get('code');
      if (!pending || !code || params.get('state') !== pending.state) {
        throw new CognitoAuthError('invalid_state', 'This sign-in link is no longer valid.');
      }
      await writeTokens(
        await tokenRequest({
          grant_type: 'authorization_code',
          code,
          redirect_uri: settings.redirectUri,
          code_verifier: pending.verifier,
        }),
      );
    },

    async signOut() {
      const tokens = await readTokens();
      await writeTokens(null);
      if (tokens?.refreshToken) {
        // Best effort: revoke the refresh token so it can't mint new tokens.
        await fetchImpl(`${base}/oauth2/revoke`, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: form({ token: tokens.refreshToken, client_id: settings.clientId }),
        }).catch(() => undefined);
      }
      if (tokens) {
        await platform.logout(
          `${base}/logout?${form({ client_id: settings.clientId, logout_uri: settings.logoutUri })}`,
          settings.logoutUri,
        );
      }
    },
  };
  return provider;
}
