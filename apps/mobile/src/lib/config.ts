import { createConfig, type AppConfig } from '@radial-pulse/config';

/**
 * The only place in the mobile app that reads environment variables.
 * Expo inlines EXPO_PUBLIC_* at build time, and only for literal
 * `process.env.EXPO_PUBLIC_X` expressions — so they are listed explicitly.
 */
export function readRawEnv() {
  return {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    cognito: {
      userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
      domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN,
    },
    apiMocking: process.env.EXPO_PUBLIC_API_MOCKING === 'true',
  };
}

export function loadConfig(): AppConfig {
  return createConfig(readRawEnv());
}
