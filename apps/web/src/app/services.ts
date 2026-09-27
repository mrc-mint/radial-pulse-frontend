import { createApiClient, type ApiClient, type ApiClientOptions } from '@radial-pulse/api-client';
import type { AppConfig } from '@radial-pulse/config';
import { createSessionController, type SessionController } from '@radial-pulse/platform-shell/core';
import type { AuthProvider } from './session/auth';
import { createApiSessionAdapter } from './session/api-session';

export interface AppServices {
  api: ApiClient;
  session: SessionController;
}

/**
 * Builds the API client and session together. The client asks the auth
 * provider for tokens and reports 401s to the session; the session loads the
 * user from the API. Screens receive neither tokens nor the client.
 */
export function createAppServices(
  config: AppConfig,
  auth: AuthProvider,
  /** Test seam: a fetch implementation for the API client. */
  options: { fetch?: ApiClientOptions['fetch'] } = {},
): AppServices {
  // The client is built first; the session it reports 401s to is bound below.
  const sessionRef: { current?: SessionController } = {};
  const api = createApiClient({
    baseUrl: config.apiBaseUrl,
    fetch: options.fetch,
    auth: {
      getAccessToken: () => auth.getAccessToken(),
      onUnauthorized: () => sessionRef.current?.authBridge.onUnauthorized(),
    },
  });
  const session = createSessionController(createApiSessionAdapter(auth, api));
  sessionRef.current = session;
  return { api, session };
}
