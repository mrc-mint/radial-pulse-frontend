import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClient } from '../http';
import type { StorageFetch } from '../services';

interface ApiContext {
  client: ApiClient;
  storageFetch: StorageFetch | undefined;
}

const ApiClientContext = createContext<ApiContext | null>(null);

/** Provided once by the app's composition root; resource hooks read it. */
export function ApiClientProvider({
  client,
  storageFetch,
  children,
}: {
  client: ApiClient;
  /**
   * How files reach object storage (pre-signed URLs). Defaults to the global
   * fetch; the mobile mocks pass their in-process fetch, because React Native
   * has no service worker to intercept the request.
   */
  storageFetch?: StorageFetch;
  children: ReactNode;
}) {
  return (
    <ApiClientContext.Provider value={{ client, storageFetch }}>
      {children}
    </ApiClientContext.Provider>
  );
}

function useApiContext(): ApiContext {
  const context = useContext(ApiClientContext);
  if (!context) throw new Error('useApiClient must be used inside <ApiClientProvider>.');
  return context;
}

/** For resource hooks inside this package. Screens use the hooks, not the client. */
export function useApiClient(): ApiClient {
  return useApiContext().client;
}

/** For upload hooks inside this package: the fetch that talks to object storage. */
export function useStorageFetch(): StorageFetch | undefined {
  return useApiContext().storageFetch;
}
