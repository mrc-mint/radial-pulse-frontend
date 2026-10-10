import { ApiClientProvider } from '@radial-pulse/api-client-react';
import { ConfigProvider, SessionProvider } from '@radial-pulse/shell-core';
import { NativeAppShell } from '@radial-pulse/mobile-shell';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConnectBrowserProvider } from './connect-browser';
import type { MobileServices } from './services';

/**
 * TanStack Query treats the app as focused only while it is in the
 * foreground, so polling (chat, inbox) and refetch-on-focus pause in the
 * background. The web build uses the browser's own focus events.
 */
function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (status) =>
      focusManager.setFocused(status === 'active'),
    );
    return () => subscription.remove();
  }, []);
}

/** Wires config, session, API client, query cache and Connect browser for every screen. */
export function AppProviders({
  services,
  children,
}: {
  services: MobileServices;
  children: ReactNode;
}) {
  useAppStateFocus();
  return (
    <SafeAreaProvider>
      <ConfigProvider config={services.config}>
        <SessionProvider controller={services.session}>
          <ApiClientProvider client={services.api} storageFetch={services.storageFetch}>
            <QueryClientProvider client={services.queryClient}>
              <ConnectBrowserProvider browser={services.connectBrowser}>
                <NativeAppShell>{children}</NativeAppShell>
              </ConnectBrowserProvider>
            </QueryClientProvider>
          </ApiClientProvider>
        </SessionProvider>
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
