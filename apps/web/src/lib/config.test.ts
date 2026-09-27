import { describe, expect, it } from 'vitest';
import { loadRuntimeConfig } from './config';

const json = (body: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('loadRuntimeConfig', () => {
  it('validates the served config', async () => {
    const cfg = await loadRuntimeConfig(
      json({
        appEnv: 'dev',
        apiBaseUrl: 'https://api.dev.example.com',
        cognito: { userPoolId: 'p', userPoolClientId: 'c', domain: 'd' },
      }),
    );
    expect(cfg.appEnv).toBe('dev');
  });

  it('fails fast when config.json is missing', async () => {
    await expect(loadRuntimeConfig(json({}, 404))).rejects.toThrow(/config\.json/);
  });
});
