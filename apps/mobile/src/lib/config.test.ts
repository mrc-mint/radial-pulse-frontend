import { ConfigError } from '@radial-pulse/config';
import { loadConfig } from './config';

describe('mobile loadConfig', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('fails fast when required EXPO_PUBLIC_* values are missing', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => loadConfig()).toThrow(ConfigError);
  });
});
