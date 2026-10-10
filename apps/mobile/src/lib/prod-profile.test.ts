import { ConfigError, createConfig } from '@radial-pulse/config';
import eas from '../../eas.json';

/**
 * Production builds can never run the contract mocks. Three independent
 * guards, each tested here:
 *   1. the EAS `prod` profile sets the prod environment for both the build
 *      (APP_ENV, read by app.config.ts and metro.config.js) and the app
 *      (EXPO_PUBLIC_APP_ENV, inlined into src/lib/config.ts), and never turns
 *      mocking on;
 *   2. createConfig() refuses API mocking when the app environment is prod;
 *   3. metro.config.js replaces src/shell/mocking with a stub in prod builds.
 */
type Env = Record<string, string | undefined>;
const profiles = eas.build as Record<string, { env?: Env }>;
const prodEnv: Env = profiles.prod?.env ?? {};

/**
 * The raw config a prod build gets: what src/lib/config.ts reads from the
 * inlined EXPO_PUBLIC_* values (Expo inlines them at build time, so they are
 * passed here directly). URLs and ids stand in for EAS environment variables.
 */
function prodRawConfig(apiMocking: string | undefined) {
  return {
    appEnv: prodEnv.EXPO_PUBLIC_APP_ENV,
    apiBaseUrl: 'https://api.example.test',
    cognito: { userPoolId: 'pool', userPoolClientId: 'client', domain: 'auth.example.test' },
    apiMocking: apiMocking === 'true',
  };
}

describe('EAS prod profile', () => {
  it('sets the prod environment for the build and the app', () => {
    expect(prodEnv.APP_ENV).toBe('prod');
    expect(prodEnv.EXPO_PUBLIC_APP_ENV).toBe('prod');
  });

  it('never turns API mocking on', () => {
    expect(prodEnv.EXPO_PUBLIC_API_MOCKING).not.toBe('true');
  });

  it('builds a prod config with mocking off', () => {
    const config = createConfig(prodRawConfig(prodEnv.EXPO_PUBLIC_API_MOCKING));
    expect(config.appEnv).toBe('prod');
    expect(config.apiMocking).toBe(false);
  });

  it('refuses API mocking even if it is switched on for a prod build', () => {
    expect(() => createConfig(prodRawConfig('true'))).toThrow(ConfigError);
  });
});

describe('metro.config.js', () => {
  // Metro loads its config in plain Node (CommonJS, not through Jest's
  // transform), so evaluate it the same way in a child process.
  const { execFileSync } = jest.requireActual('child_process') as {
    execFileSync: (file: string, args: string[], options: object) => string;
  };
  const RESOLVE = `
    const path = require('path');
    const config = require('./metro.config.js');
    const services = path.join(process.cwd(), 'src', 'shell', 'services.ts');
    const fallback = () => ({ type: 'sourceFile', filePath: 'default-resolution' });
    const resolve = config.resolver.resolveRequest;
    const result = resolve
      ? resolve({ originModulePath: services, resolveRequest: fallback }, './mocking', 'android')
      : fallback();
    process.stdout.write(JSON.stringify({ ...result, sep: path.sep }));
  `;

  function resolveMocking(appEnv: string) {
    const out = execFileSync(process.execPath, ['-e', RESOLVE], {
      cwd: process.cwd(),
      env: { ...process.env, APP_ENV: appEnv },
      encoding: 'utf8',
    });
    return JSON.parse(out) as { type: string; filePath: string; sep: string };
  }

  it('swaps the mocking module for the stub in prod builds', () => {
    const { type, filePath, sep } = resolveMocking('prod');
    expect(type).toBe('sourceFile');
    expect(filePath.endsWith(['src', 'shell', 'mocking.prod.ts'].join(sep))).toBe(true);
  }, 30_000);

  it('keeps the real mocking module outside prod', () => {
    expect(resolveMocking('dev').filePath).toBe('default-resolution');
  }, 30_000);
});
