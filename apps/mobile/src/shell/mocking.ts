import { createMockFetch, MOCK_PERSONAS, MOCK_TOKEN_PREFIX } from '@radial-pulse/api-mocks';
import type { StorageFetch } from '@radial-pulse/api-client';
import type { AppConfig } from '@radial-pulse/config';
import { createMockAuth, type AuthProvider } from '@radial-pulse/auth';
import type { ConnectBrowser } from '@radial-pulse/clinic-kit';
import { mockConnectBrowser } from './mock-connect-browser';

export interface MockServices {
  auth: AuthProvider;
  fetch: (request: Request) => Promise<Response>;
  /** Pre-signed uploads go to the in-process mock storage too. */
  storageFetch: StorageFetch;
  connectBrowser: ConnectBrowser;
}

/**
 * DEV ONLY — loaded when `apiMocking` is on (createConfig() refuses it in
 * prod; metro.config.js swaps this module for a stub in prod builds).
 *
 * React Native has no service worker, so the contract mocks answer
 * in-process through the API client's fetch.
 */
export function startMocking(config: AppConfig): MockServices {
  // Photos and audio come back as data: URLs: React Native's Image and audio
  // player load URLs natively, outside this in-process fetch.
  const fetch = createMockFetch({ baseUrl: config.apiBaseUrl, latencyMs: 300, inlineMedia: true });
  return {
    // Clinic is for Clinic Administrators; the other personas stay
    // available to check the "use the web portal" screen.
    auth: createMockAuth(config, MOCK_PERSONAS, MOCK_TOKEN_PREFIX),
    fetch,
    storageFetch: (url, init) => fetch(new Request(url, init)),
    connectBrowser: mockConnectBrowser,
  };
}
