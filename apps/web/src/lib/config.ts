import { createConfig, type AppConfig } from '@radial-pulse/config';

/**
 * Loads /config.json once at boot and validates it. The only place in the web
 * app that knows where configuration comes from. Components use useConfig()
 * (Phase 5) instead of reading this directly.
 */
export async function loadRuntimeConfig(fetchImpl: typeof fetch = fetch): Promise<AppConfig> {
  const res = await fetchImpl('/config.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load /config.json (HTTP ${res.status})`);
  return createConfig(await res.json());
}
