import type { ApiClient } from '@radial-pulse/api-client';
import { ApiClientProvider, createQueryClient } from '@radial-pulse/api-client-react';
import type { AppConfig } from '@radial-pulse/config';
import { ConfigProvider, SessionProvider } from '@radial-pulse/shell-core';
import { type SessionController } from '@radial-pulse/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { createAppRouter } from './router';

export interface AppProps {
  config: AppConfig;
  session: SessionController;
  api: ApiClient;
  router: ReturnType<typeof createAppRouter>;
}

/**
 * Composition root. The only place that wires config, session and data
 * layers together (see services.ts). Screens never receive tokens or the client.
 */
export function App({ config, session, api, router }: AppProps) {
  const [queryClient] = useState(createQueryClient);

  // Signing out drops every cached response, so the next user of this tab
  // can never see the previous user's data.
  useEffect(
    () =>
      session.subscribe(() => {
        if (session.getState().status === 'unauthenticated') queryClient.clear();
      }),
    [session, queryClient],
  );

  return (
    <ConfigProvider config={config}>
      <SessionProvider controller={session}>
        <ApiClientProvider client={api}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ApiClientProvider>
      </SessionProvider>
    </ConfigProvider>
  );
}
