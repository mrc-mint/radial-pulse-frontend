import { createMockFetch, MOCK_PERSONAS, MOCK_TOKEN_PREFIX } from '@radial-pulse/api-client/mocks';
import type { AppConfig } from '@radial-pulse/config';
import { createMockAuth, type AuthProvider } from '@radial-pulse/platform-shell/core';
import type { ConnectBrowser } from './connect-browser';
import { mockConnectBrowser } from './mock-connect-browser';

export interface MockServices {
  auth: AuthProvider;
  fetch: (request: Request) => Promise<Response>;
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
  return {
    // The mobile app is for Clinic Administrators; the other personas stay
    // available to check the "use the web portal" screen.
    auth: createMockAuth(config, MOCK_PERSONAS, MOCK_TOKEN_PREFIX),
    fetch: createMockFetch({ baseUrl: config.apiBaseUrl, latencyMs: 300 }),
    connectBrowser: mockConnectBrowser,
  };
}
