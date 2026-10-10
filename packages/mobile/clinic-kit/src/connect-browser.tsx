import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * Opens a platform's sign-in page for "Connect Your Accounts" and waits for
 * the redirect back to the app. The API returns the sign-in address
 * (`ConnectionStartResponse.authorization_url`); the app never builds one.
 */
export type ConnectBrowser = (
  authorizationUrl: string,
  redirectUri: string,
) => Promise<{ type: 'success'; url: string } | { type: 'cancel' }>;

/** The system browser session (ASWebAuthenticationSession / Custom Tabs). */
export const systemConnectBrowser: ConnectBrowser = async (authorizationUrl, redirectUri) => {
  const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, redirectUri);
  return result.type === 'success' ? { type: 'success', url: result.url } : { type: 'cancel' };
};

const ConnectBrowserContext = createContext<ConnectBrowser>(systemConnectBrowser);

export function ConnectBrowserProvider({
  browser,
  children,
}: {
  browser: ConnectBrowser;
  children: ReactNode;
}) {
  return (
    <ConnectBrowserContext.Provider value={browser}>{children}</ConnectBrowserContext.Provider>
  );
}

export function useConnectBrowser(): ConnectBrowser {
  return useContext(ConnectBrowserContext);
}
