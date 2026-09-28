import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClient } from '../http';

const ApiClientContext = createContext<ApiClient | null>(null);

/** Provided once by the app's composition root; resource hooks read it. */
export function ApiClientProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

/** For resource hooks inside this package. Screens use the hooks, not the client. */
export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error('useApiClient must be used inside <ApiClientProvider>.');
  return client;
}
