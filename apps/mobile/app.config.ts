import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Build-time configuration per environment (architecture §8). The EAS build
 * profile sets APP_ENV; each environment gets its own bundle id and name so
 * dev and prod install side by side, and a dev build can never point at prod.
 */
type AppEnv = 'local' | 'dev' | 'prod';
const APP_ENV = (process.env.APP_ENV ?? 'local') as AppEnv;

const variants: Record<AppEnv, { name: string; idSuffix: string }> = {
  local: { name: 'Radial Pulse (Local)', idSuffix: '.local' },
  dev: { name: 'Radial Pulse (Dev)', idSuffix: '.dev' },
  prod: { name: 'Radial Pulse', idSuffix: '' },
};

// PLACEHOLDER bundle identifier — replace with the organization's reverse-DNS id.
const BASE_ID = 'com.radialpulse.app';

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = variants[APP_ENV];
  return {
    ...config,
    name: variant.name,
    slug: 'radial-pulse',
    scheme: `radialpulse${variant.idSuffix.replace('.', '-')}`,
    version: '0.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    ios: { bundleIdentifier: `${BASE_ID}${variant.idSuffix}`, supportsTablet: false },
    android: { package: `${BASE_ID}${variant.idSuffix}` },
    plugins: [
      'expo-router',
      // Playback only: voice samples are uploaded as files, never recorded.
      ['expo-audio', { microphonePermission: false }],
      // Photos come from the library; no camera capture in V1.
      [
        'expo-image-picker',
        {
          photosPermission:
            'Radial Pulse uses your photo library so you can upload clinic and doctor photos.',
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
    ],
    experiments: { typedRoutes: true },
    extra: { appEnv: APP_ENV },
  };
};
