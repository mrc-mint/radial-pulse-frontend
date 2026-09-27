import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../http';
import { assessmentsService, authService, clinicsService } from '../services';
import { createMockDb } from './data';
import { createMockFetch } from './in-process';
import { MOCK_TOKEN_PREFIX } from './personas';

const baseUrl = 'https://api.test.radialpulse.example';

function clientAs(persona: string | null, fallback = vi.fn(async () => new Response('net'))) {
  const fetch = createMockFetch({ baseUrl, db: createMockDb() }, fallback);
  const api = createApiClient({
    baseUrl,
    fetch,
    auth: {
      getAccessToken: async () => (persona ? `${MOCK_TOKEN_PREFIX}${persona}` : null),
      onUnauthorized: () => {},
    },
  });
  return { api, fallback };
}

describe('createMockFetch (React Native: no service worker)', () => {
  it('answers contract operations in-process with the persona’s access', async () => {
    const { api, fallback } = clientAs('clinic-administrator');
    const me = await authService.me(api);
    expect(me.clinics.every((c) => c.clinic_role === 'clinic_administrator')).toBe(true);

    const clinics = await clinicsService.list(api, { limit: 200 });
    expect(clinics.items.map((c) => c.id).sort()).toEqual(
      me.clinics.map((c) => c.clinic_id).sort(),
    );

    const list = await assessmentsService.list(api, clinics.items[0]!.id, {});
    expect(list.items.every((a) => a.publication_state === 'published')).toBe(true);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('returns the mocks’ 401 without a sign-in', async () => {
    const { api } = clientAs(null);
    await expect(authService.me(api)).rejects.toMatchObject({ kind: 'unauthorized' });
  });

  it('sends requests outside the contract mocks to the network', async () => {
    const fallback = vi.fn(async () => new Response('from network'));
    const fetch = createMockFetch({ baseUrl, db: createMockDb() }, fallback);
    const response = await fetch(new Request('https://elsewhere.example/file'));
    expect(await response.text()).toBe('from network');
  });
});
