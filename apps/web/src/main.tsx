import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@radial-pulse/design-tokens/css';
import { loadRuntimeConfig } from './lib/config';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();
const root = createRoot(document.getElementById('root')!);

// Boot: load and validate runtime config first, then mount. An invalid config
// stops here with a readable message instead of failing somewhere deeper.
loadRuntimeConfig()
  .then(() => {
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StrictMode>,
    );
  })
  .catch((err: unknown) => {
    root.render(<pre role="alert">{err instanceof Error ? err.message : String(err)}</pre>);
  });
