import { isApiError } from '@radial-pulse/api-client';
import { useCompleteConnection, useStartConnection } from '@radial-pulse/api-client/react';
import { useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { useConnectBrowser } from './connect-browser';

type Platform = Schema<'ConnectionPlatform'>;

/** Where the platform sends the person back (must be on the API's allowed list). */
export const CONNECT_REDIRECT_PATH = 'connect/callback';

/**
 * "Connect" for one platform, following the contract:
 *   1. POST …/connections/{platform}/start  → the platform's sign-in address
 *   2. the person signs in to the platform (system browser session)
 *   3. POST …/connections/{platform}/complete with the returned code + state
 * The app never sees platform tokens; they stay on the server.
 */
export function useConnectPlatform() {
  const clinicId = useClinicId();
  const browser = useConnectBrowser();
  const start = useStartConnection(clinicId);
  const complete = useCompleteConnection(clinicId);
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [error, setError] = useState<{ platform: Platform; message: string } | null>(null);

  async function connect(platform: Platform): Promise<'connected' | 'cancelled' | 'failed'> {
    setConnecting(platform);
    setError(null);
    try {
      const redirectUri = Linking.createURL(CONNECT_REDIRECT_PATH);
      const { authorization_url } = await start.mutateAsync({ platform, redirectUri });
      const result = await browser(authorization_url, redirectUri);
      if (result.type !== 'success') return 'cancelled';
      const params = Linking.parse(result.url).queryParams ?? {};
      const code = typeof params.code === 'string' ? params.code : null;
      const state = typeof params.state === 'string' ? params.state : null;
      if (!code || !state) {
        throw new Error('The sign-in didn’t finish. Please try again.');
      }
      await complete.mutateAsync({ platform, code, state });
      return 'connected';
    } catch (e) {
      const message = isApiError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Something went wrong. Please try again.';
      setError({ platform, message });
      return 'failed';
    } finally {
      setConnecting(null);
    }
  }

  return { connect, connecting, error };
}
