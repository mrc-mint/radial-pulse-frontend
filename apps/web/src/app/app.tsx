import type { AppConfig } from '@radial-pulse/config';
import {
  ConfigProvider,
  SessionProvider,
  type SessionController,
} from '@radial-pulse/platform-shell/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useState } from 'react';
import type { createAppRouter } from './router';

export interface AppProps {
  config: AppConfig;
  session: SessionController;
  router: ReturnType<typeof createAppRouter>;
}

/**
 * Composition root. The only place that wires config, session and data
 * layers together. `session.authBridge` is handed to the API client here
 * (Phase 4) — screens never receive tokens.
 */
export function App({ config, session, router }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ConfigProvider config={config}>
      <SessionProvider controller={session}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionProvider>
    </ConfigProvider>
  );
}
