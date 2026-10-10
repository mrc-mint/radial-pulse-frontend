import type { ApiClient, StorageFetch } from '@radial-pulse/api-client';
import { createQueryClient } from '@radial-pulse/api-client-react';
import { isCognitoConfigured, type AppConfig } from '@radial-pulse/config';
import { createAppServices, unconfiguredAuth, type SessionController } from '@radial-pulse/auth';
import type { QueryClient } from '@tanstack/react-query';
import { loadConfig } from '../lib/config';
import { createMobileCognitoAuth } from './cognito';
import { systemConnectBrowser, type ConnectBrowser } from './connect-browser';
import type * as Mocking from './mocking';

export interface MobileServices {
  config: AppConfig;
  api: ApiClient;
  session: SessionController;
  queryClient: QueryClient;
  connectBrowser: ConnectBrowser;
  /** Object storage fetch for uploads; undefined means the global fetch. */
  storageFetch?: StorageFetch;
}

/**
 * Composition root: config, auth, API client, session and query cache.
 * Auth is Cognito Managed Login (Authorization Code + PKCE, tokens in the
 * secure store) when configured, development personas with API mocking, and
 * otherwise no sign-in. Screens never see tokens or the client.
 */
export function createMobileServices(): MobileServices {
  const config = loadConfig();
  // A synchronous require keeps start-up synchronous; metro.config.js swaps
  // the module for a stub in prod builds, so the mocks never ship.
  const mocks = config.apiMocking
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('./mocking') as typeof Mocking).startMocking(config)
    : null;
  const auth =
    mocks?.auth ??
    (isCognitoConfigured(config) ? createMobileCognitoAuth(config) : unconfiguredAuth);
  const { api, session } = createAppServices(config, auth, {
    fetch: mocks?.fetch,
  });
  const queryClient = createQueryClient();
  // Signing out drops every cached response, so the next person on this
  // device can never see the previous person's clinic data.
  session.subscribe(() => {
    if (session.getState().status === 'unauthenticated') queryClient.clear();
  });
  void session.restore();
  return {
    config,
    api,
    session,
    queryClient,
    connectBrowser: mocks?.connectBrowser ?? systemConnectBrowser,
    storageFetch: mocks?.storageFetch,
  };
}
