import {
  createMockHandlers,
  MOCK_PERSONAS,
  MOCK_TOKEN_PREFIX,
} from '@radial-pulse/api-client/mocks';
import type { AppConfig } from '@radial-pulse/config';
import { setupWorker } from 'msw/browser';
import { createMockAuth, type AuthProvider } from '@radial-pulse/platform-shell/core';

/**
 * DEV ONLY — loaded with a dynamic import when `apiMocking` is on, so neither
 * MSW nor the mock data ship in a production bundle. Starts the service
 * worker with the contract mocks and returns the matching mock sign-in.
 */
export async function startMocking(config: AppConfig): Promise<AuthProvider> {
  const worker = setupWorker(...createMockHandlers({ baseUrl: config.apiBaseUrl, latencyMs: 350 }));
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  return createMockAuth(config, MOCK_PERSONAS, MOCK_TOKEN_PREFIX);
}
