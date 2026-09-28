import type { ConnectBrowser } from './connect-browser';

/**
 * DEV ONLY (API mocking). No platform sign-in page exists in mock mode: hand
 * the API's one-time `state` straight back, as the platform would after a
 * successful sign-in.
 */
export const mockConnectBrowser: ConnectBrowser = async (authorizationUrl, redirectUri) => {
  const match = /[?&]state=([^&#]+)/.exec(authorizationUrl);
  if (!match?.[1]) return { type: 'cancel' };
  const separator = redirectUri.includes('?') ? '&' : '?';
  return { type: 'success', url: `${redirectUri}${separator}code=mock-code&state=${match[1]}` };
};
