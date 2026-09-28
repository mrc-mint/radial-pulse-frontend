import type { ApiClient } from '@radial-pulse/api-client';
import { createQueryClient } from '@radial-pulse/api-client/react';
import type { AppConfig } from '@radial-pulse/config';
import {
  createAppServices,
  unconfiguredAuth,
  type SessionController,
} from '@radial-pulse/platform-shell/core';
import type { QueryClient } from '@tanstack/react-query';
import { loadConfig } from '../lib/config';
import { systemConnectBrowser, type ConnectBrowser } from './connect-browser';
import type * as Mocking from './mocking';

export interface MobileServices {
  config: AppConfig;
  api: ApiClient;
  session: SessionController;
  queryClient: QueryClient;
  connectBrowser: ConnectBrowser;
}

/**
 * Composition root: config, auth, API client, session and query cache.
 * Phase 7 replaces `unconfiguredAuth` with Cognito managed login (Amplify
 * Auth, tokens in expo-secure-store). Until then only mocked APIs sign in.
 * Screens never see tokens or the client.
 */
export function createMobileServices(): MobileServices {
  const config = loadConfig();
  // A synchronous require keeps start-up synchronous; metro.config.js swaps
  // the module for a stub in prod builds, so the mocks never ship.
  const mocks = config.apiMocking
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('./mocking') as typeof Mocking).startMocking(config)
    : null;
  const { api, session } = createAppServices(config, mocks?.auth ?? unconfiguredAuth, {
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
  };
}
