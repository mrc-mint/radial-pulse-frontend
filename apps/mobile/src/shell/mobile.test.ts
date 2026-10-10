import { mockConnectBrowser } from './mock-connect-browser';
import { isTabVisible, TAB_SECTIONS } from './module-registry';
import { createChunkedSecureStorage } from './secure-token-storage';

// Clinic's API path (in-process contract mocks behind the client's
// fetch) is tested with the mocks in @radial-pulse/api-mocks (in-process).

describe('tabs', () => {
  it('are Home, Insights, Social Presence, Assessments and Profile — chat is not a tab', () => {
    expect(TAB_SECTIONS.map((s) => s.label)).toEqual([
      'Home',
      'Insights',
      'Social Presence',
      'Assessments',
      'Profile',
    ]);
  });

  it('follow the selected clinic’s permissions', () => {
    const insights = TAB_SECTIONS.find((s) => s.id === 'insights')!;
    const profile = TAB_SECTIONS.find((s) => s.id === 'profile')!;
    expect(isTabVisible(insights, new Set(['clinics:read']))).toBe(false);
    expect(isTabVisible(insights, new Set(['assessments:read']))).toBe(true);
    expect(isTabVisible(profile, new Set())).toBe(true);
  });
});

describe('connected accounts (mock Connect)', () => {
  it('mock Connect returns the API’s one-time state to the redirect address', async () => {
    const result = await mockConnectBrowser(
      'https://mock-oauth.radialpulse.example/youtube?state=abc123&redirect_uri=x',
      'radialpulse-local://connect/callback',
    );
    expect(result).toEqual({
      type: 'success',
      url: 'radialpulse-local://connect/callback?code=mock-code&state=abc123',
    });
    expect(await mockConnectBrowser('https://no-state.example', 'x://cb')).toEqual({
      type: 'cancel',
    });
  });
});

describe('secure token storage', () => {
  function fakeStore() {
    const values = new Map<string, string>();
    return {
      values,
      getItemAsync: async (k: string) => values.get(k) ?? null,
      setItemAsync: async (k: string, v: string) => void values.set(k, v),
      deleteItemAsync: async (k: string) => void values.delete(k),
    };
  }

  it('splits large tokens into chunks and reads them back', async () => {
    const store = fakeStore();
    const storage = createChunkedSecureStorage(store);
    const token = 'x'.repeat(4000);
    await storage.setItem('rp.auth.tokens', token);
    expect(await storage.getItem('rp.auth.tokens')).toBe(token);
    expect(store.values.get('rp.auth.tokens.n')).toBe('3');
    for (const v of store.values.values()) expect(v.length).toBeLessThanOrEqual(1800);
  });

  it('removes every chunk, and treats a half-written value as absent', async () => {
    const store = fakeStore();
    const storage = createChunkedSecureStorage(store);
    await storage.setItem('k', 'y'.repeat(3000));
    store.values.delete('k.1');
    expect(await storage.getItem('k')).toBeNull();
    await storage.removeItem('k');
    expect(store.values.size).toBe(0);
  });
});
