import type { AppConfig } from '@radial-pulse/config';
import { createCognitoAuth, type CognitoAuthProvider } from '@radial-pulse/platform-shell/core';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { createChunkedSecureStorage } from './secure-token-storage';

/**
 * Cognito Managed Login for Clinic (Authorization Code + PKCE, ADR
 * 0006). Managed Login opens in the system auth session
 * (ASWebAuthenticationSession / Custom Tabs), which hands the callback
 * straight back; tokens are kept in the secure store.
 *
 * Redirects (`<scheme>://auth/callback`, `<scheme>://signed-out`) must be on
 * the Clinic app client's allowed callback and sign-out URLs. The scheme is
 * per environment (app.config.ts): radialpulse-local, radialpulse-dev,
 * radialpulse. Expo Go uses an exp:// address instead, so Cognito sign-in
 * needs a development build.
 */
export function createMobileCognitoAuth(config: AppConfig): CognitoAuthProvider {
  const redirectUri = Linking.createURL('auth/callback');
  const logoutUri = Linking.createURL('signed-out');
  return createCognitoAuth(
    {
      domain: config.cognito.domain,
      clientId: config.cognito.userPoolClientId,
      redirectUri,
      logoutUri,
      scopes: config.cognito.scopes,
    },
    {
      storage: createChunkedSecureStorage(SecureStore),
      randomBytes: (n) => Crypto.getRandomBytes(n),
      sha256: async (data) =>
        new Uint8Array(
          await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data as Uint8Array<ArrayBuffer>),
        ),
      authorize: async (url, callback) => {
        const result = await WebBrowser.openAuthSessionAsync(url, callback, {
          // iOS: no shared cookies, so the next person must sign in again.
          preferEphemeralSession: true,
        });
        // Cancelled or dismissed: back to the sign-in screen, no error.
        return result.type === 'success' ? result.url : null;
      },
      logout: async (url, returnTo) => {
        // iOS sessions are ephemeral, so there is no Managed Login cookie to
        // end. Android Custom Tabs share cookies: end the session there.
        if (Platform.OS === 'android') {
          await WebBrowser.openAuthSessionAsync(url, returnTo).catch(() => undefined);
        }
      },
    },
  );
}
