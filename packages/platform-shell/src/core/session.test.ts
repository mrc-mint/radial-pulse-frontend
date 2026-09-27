import { describe, expect, it, vi } from 'vitest';
import { createSessionController, type Session, type SessionAdapter } from './session';

const session: Session = {
  user: {
    id: 'u_1',
    name: 'Priya Shah',
    email: 'priya.shah@radialpulse.example',
    roles: ['DIGITAL_SUCCESS_MANAGER'],
  },
  tenant: { id: 't_1', name: 'Radial Pulse' },
  capabilities: new Set(['clinics.assigned_only']),
};

function adapter(overrides: Partial<SessionAdapter> = {}): SessionAdapter {
  return {
    restore: vi.fn(async () => session),
    signIn: vi.fn(async () => session),
    signOut: vi.fn(async () => {}),
    getAccessToken: vi.fn(async () => 'token-123'),
    ...overrides,
  };
}

describe('createSessionController', () => {
  it('starts loading and restores an existing session', async () => {
    const controller = createSessionController(adapter());
    expect(controller.getState().status).toBe('loading');
    await controller.restore();
    expect(controller.getState()).toEqual({ status: 'authenticated', session });
  });

  it('is unauthenticated when there is no session to restore', async () => {
    const controller = createSessionController(adapter({ restore: async () => null }));
    await controller.restore();
    expect(controller.getState().status).toBe('unauthenticated');
  });

  it('surfaces restore failures as an error state', async () => {
    const failure = new Error('network');
    const controller = createSessionController(adapter({ restore: () => Promise.reject(failure) }));
    await controller.restore();
    expect(controller.getState()).toEqual({ status: 'error', error: failure });
  });

  it('restores only once while a restore is in flight', async () => {
    const a = adapter();
    const controller = createSessionController(a);
    await Promise.all([controller.restore(), controller.restore()]);
    expect(a.restore).toHaveBeenCalledTimes(1);
  });

  it('signs in with an option and signs out', async () => {
    const a = adapter();
    const controller = createSessionController(a);
    await controller.signIn('digital-success-manager');
    expect(a.signIn).toHaveBeenCalledWith('digital-success-manager');
    expect(controller.getState().status).toBe('authenticated');
    await controller.signOut();
    expect(controller.getState().status).toBe('unauthenticated');
  });

  it('notifies subscribers of changes', async () => {
    const controller = createSessionController(adapter());
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    await controller.restore();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('exposes the access token only through the API auth bridge', async () => {
    const controller = createSessionController(adapter());
    expect(await controller.authBridge.getAccessToken()).toBe('token-123');
    expect(Object.keys(controller)).not.toContain('getAccessToken');
  });

  it('returns to sign-in when the API reports 401', async () => {
    const controller = createSessionController(adapter());
    await controller.restore();
    controller.authBridge.onUnauthorized();
    expect(controller.getState().status).toBe('unauthenticated');
  });
});
