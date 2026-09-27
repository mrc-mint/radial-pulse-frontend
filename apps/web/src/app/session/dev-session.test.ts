import { describe, expect, it } from 'vitest';
import { CAPABILITIES } from '../capabilities';
import { createDevSessionAdapter } from './dev-session';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('createDevSessionAdapter', () => {
  it('refuses to run in prod', () => {
    expect(() => createDevSessionAdapter({ appEnv: 'prod' })).toThrow(/prod/);
  });

  it('offers the two platform personas', () => {
    const adapter = createDevSessionAdapter({ appEnv: 'local' }, memoryStorage());
    expect(adapter.signInOptions?.map((o) => o.label)).toEqual([
      'Platform Administrator',
      'Digital Success Manager',
    ]);
  });

  it('signs in, survives a reload in the same tab, and signs out', async () => {
    const storage = memoryStorage();
    const adapter = createDevSessionAdapter({ appEnv: 'dev' }, storage);
    expect(await adapter.restore()).toBeNull();

    const session = await adapter.signIn('digital-success-manager');
    expect(session?.user.name).toBe('Priya Shah');
    expect(session?.capabilities.has(CAPABILITIES.assignedClinicsOnly)).toBe(true);
    expect(session?.capabilities.has(CAPABILITIES.manageUsers)).toBe(false);

    const reloaded = createDevSessionAdapter({ appEnv: 'dev' }, storage);
    expect((await reloaded.restore())?.user.name).toBe('Priya Shah');

    await reloaded.signOut();
    expect(await reloaded.restore()).toBeNull();
  });

  it('works without storage and never issues tokens', async () => {
    const adapter = createDevSessionAdapter({ appEnv: 'local' }, null);
    expect((await adapter.signIn('platform-administrator'))?.user.name).toBe('Rohan Agarwal');
    expect(await adapter.getAccessToken()).toBeNull();
  });
});
