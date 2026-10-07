import { createHash, randomBytes } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  base64Url,
  CognitoAuthError,
  createCognitoAuth,
  type CognitoPlatform,
} from './cognito-auth';

const SETTINGS = {
  domain: 'https://auth.dev.example.com/',
  clientId: 'public-client',
  redirectUri: 'http://localhost:4200/auth/callback',
  logoutUri: 'http://localhost:4200/sign-in',
  scopes: ['openid', 'email'],
};

function setup(tokenResponses: Array<{ status?: number; body: Record<string, unknown> }> = []) {
  const store = new Map<string, string>();
  let clock = 1_000_000;
  const requests: Array<{ url: string; body: URLSearchParams }> = [];
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    requests.push({ url, body: new URLSearchParams(String(init.body)) });
    if (url.endsWith('/oauth2/revoke')) return new Response(null, { status: 200 });
    const next = tokenResponses.shift() ?? { status: 400, body: { error: 'invalid_grant' } };
    return new Response(JSON.stringify(next.body), { status: next.status ?? 200 });
  });
  const platform: CognitoPlatform = {
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
      removeItem: (k) => void store.delete(k),
    },
    randomBytes: (n) => new Uint8Array(randomBytes(n)),
    sha256: async (data) => new Uint8Array(createHash('sha256').update(data).digest()),
    authorize: vi.fn(async () => null),
    logout: vi.fn(async () => {}),
    fetch,
    now: () => clock,
  };
  const auth = createCognitoAuth(SETTINGS, platform);
  return {
    auth,
    platform,
    store,
    requests,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

const tokens = (access: string, refresh: string | null = 'refresh-1', expiresIn = 3600) => ({
  body: {
    access_token: access,
    id_token: 'id',
    ...(refresh ? { refresh_token: refresh } : {}),
    expires_in: expiresIn,
    token_type: 'Bearer',
  },
});

/** Runs signIn, then returns the authorize URL the platform was asked to open. */
async function startSignIn(ctx: ReturnType<typeof setup>) {
  await ctx.auth.signIn();
  const call = vi.mocked(ctx.platform.authorize).mock.calls[0]!;
  return new URL(call[0]);
}

describe('createCognitoAuth', () => {
  it('encodes base64url without padding', () => {
    expect(base64Url(new Uint8Array([251, 255, 191]))).toBe('-_-_');
    expect(base64Url(new Uint8Array([1, 2]))).toBe('AQI');
  });

  it('opens Managed Login with the code flow, PKCE S256 and email/password only', async () => {
    const ctx = setup();
    const url = await startSignIn(ctx);
    expect(url.origin + url.pathname).toBe('https://auth.dev.example.com/oauth2/authorize');
    const p = url.searchParams;
    expect(p.get('response_type')).toBe('code');
    expect(p.get('client_id')).toBe('public-client');
    expect(p.get('redirect_uri')).toBe(SETTINGS.redirectUri);
    expect(p.get('scope')).toBe('openid email');
    expect(p.get('code_challenge_method')).toBe('S256');
    expect(p.get('identity_provider')).toBe('COGNITO');
    expect(p.get('client_secret')).toBeNull();

    const pending = JSON.parse(ctx.store.get('rp.auth.pending')!) as {
      verifier: string;
      state: string;
    };
    expect(p.get('state')).toBe(pending.state);
    const expected = base64Url(
      new Uint8Array(createHash('sha256').update(pending.verifier).digest()),
    );
    expect(p.get('code_challenge')).toBe(expected);
    expect(pending.verifier.length).toBeGreaterThanOrEqual(43);
  });

  it('exchanges the code with the verifier and serves the access token', async () => {
    const ctx = setup([tokens('access-1')]);
    const url = await startSignIn(ctx);
    const state = url.searchParams.get('state')!;
    await ctx.auth.completeSignIn(`${SETTINGS.redirectUri}?code=abc&state=${state}`);

    const exchange = ctx.requests[0]!;
    expect(exchange.url).toBe('https://auth.dev.example.com/oauth2/token');
    expect(exchange.body.get('grant_type')).toBe('authorization_code');
    expect(exchange.body.get('code')).toBe('abc');
    expect(exchange.body.get('code_verifier')).toBeTruthy();
    expect(exchange.body.get('client_secret')).toBeNull();
    expect(await ctx.auth.getAccessToken()).toBe('access-1');
    expect(ctx.store.has('rp.auth.pending')).toBe(false);
  });

  it('completes in place when the platform returns the callback (mobile)', async () => {
    const ctx = setup([tokens('access-1')]);
    vi.mocked(ctx.platform.authorize).mockImplementation(async (url) => {
      const state = new URL(url).searchParams.get('state');
      return `${SETTINGS.redirectUri}?code=xyz&state=${state}`;
    });
    await ctx.auth.signIn();
    expect(await ctx.auth.getAccessToken()).toBe('access-1');
  });

  it('refuses a callback whose state does not match', async () => {
    const ctx = setup([tokens('access-1')]);
    await startSignIn(ctx);
    const error = await ctx.auth
      .completeSignIn(`${SETTINGS.redirectUri}?code=abc&state=forged`)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CognitoAuthError);
    expect((error as CognitoAuthError).code).toBe('invalid_state');
    expect(ctx.requests).toHaveLength(0);
    expect(await ctx.auth.getAccessToken()).toBeNull();
  });

  it('reports an error returned by Managed Login', async () => {
    const ctx = setup();
    await startSignIn(ctx);
    await expect(
      ctx.auth.completeSignIn(`${SETTINGS.redirectUri}?error=access_denied&state=x`),
    ).rejects.toMatchObject({ code: 'access_denied' });
  });

  it('refreshes an expiring token once for concurrent callers', async () => {
    const ctx = setup([tokens('access-1'), tokens('access-2', null)]);
    const state = (await startSignIn(ctx)).searchParams.get('state')!;
    await ctx.auth.completeSignIn(`${SETTINGS.redirectUri}?code=abc&state=${state}`);
    ctx.advance(3600_000 - 30_000);
    const [a, b] = await Promise.all([ctx.auth.getAccessToken(), ctx.auth.getAccessToken()]);
    expect([a, b]).toEqual(['access-2', 'access-2']);
    const refreshes = ctx.requests.filter((r) => r.body.get('grant_type') === 'refresh_token');
    expect(refreshes).toHaveLength(1);
    expect(refreshes[0]!.body.get('refresh_token')).toBe('refresh-1');
    // The refresh token is kept when Cognito does not rotate it.
    expect(JSON.parse(ctx.store.get('rp.auth.tokens')!).refreshToken).toBe('refresh-1');
  });

  it('ends the session when the refresh token is rejected', async () => {
    const ctx = setup([tokens('access-1')]);
    const state = (await startSignIn(ctx)).searchParams.get('state')!;
    await ctx.auth.completeSignIn(`${SETTINGS.redirectUri}?code=abc&state=${state}`);
    ctx.advance(4000_000);
    expect(await ctx.auth.getAccessToken()).toBeNull();
    expect(ctx.store.has('rp.auth.tokens')).toBe(false);
  });

  it('signs out: clears tokens, revokes the refresh token, ends Managed Login', async () => {
    const ctx = setup([tokens('access-1')]);
    const state = (await startSignIn(ctx)).searchParams.get('state')!;
    await ctx.auth.completeSignIn(`${SETTINGS.redirectUri}?code=abc&state=${state}`);
    await ctx.auth.signOut();

    expect(ctx.store.has('rp.auth.tokens')).toBe(false);
    expect(await ctx.auth.getAccessToken()).toBeNull();
    const revoke = ctx.requests.find((r) => r.url.endsWith('/oauth2/revoke'))!;
    expect(revoke.body.get('token')).toBe('refresh-1');
    const [logoutUrl] = vi.mocked(ctx.platform.logout).mock.calls[0]!;
    const logout = new URL(logoutUrl);
    expect(logout.pathname).toBe('/logout');
    expect(logout.searchParams.get('client_id')).toBe('public-client');
    expect(logout.searchParams.get('logout_uri')).toBe(SETTINGS.logoutUri);
  });
});
