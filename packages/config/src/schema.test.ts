import { describe, expect, it } from 'vitest';
import { ConfigError, createConfig, isCognitoConfigured } from './schema';

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

  it('defaults the OAuth scopes to openid and email', () => {
    expect(createConfig(valid).cognito.scopes).toEqual(['openid', 'email']);
  });

  it('treats placeholder Cognito values as not configured', () => {
    expect(isCognitoConfigured(createConfig(valid))).toBe(true);
    const placeholder = { ...valid, cognito: { ...valid.cognito, domain: 'REPLACE_ME' } };
    expect(isCognitoConfigured(createConfig(placeholder))).toBe(false);
  });
});
