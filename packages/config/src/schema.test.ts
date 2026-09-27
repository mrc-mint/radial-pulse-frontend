import { describe, expect, it } from 'vitest';
import { ConfigError, createConfig } from './schema';

const valid = {
  appEnv: 'dev',
  apiBaseUrl: 'https://api.dev.example.com',
  cognito: { userPoolId: 'pool', userPoolClientId: 'client', domain: 'auth.dev.example.com' },
};

describe('createConfig', () => {
  it('accepts a valid config and defaults apiMocking to false', () => {
    expect(createConfig(valid).apiMocking).toBe(false);
  });

  it('rejects API mocking in prod', () => {
    expect(() => createConfig({ ...valid, appEnv: 'prod', apiMocking: true })).toThrow(ConfigError);
  });

  it('rejects an unknown environment', () => {
    expect(() => createConfig({ ...valid, appEnv: 'staging' })).toThrow(ConfigError);
  });

  it('rejects a missing API base URL', () => {
    expect(() => createConfig({ ...valid, apiBaseUrl: undefined })).toThrow(/apiBaseUrl/);
  });
});
