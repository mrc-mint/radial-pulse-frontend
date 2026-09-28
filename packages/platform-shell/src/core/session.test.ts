import type { MeResponse } from '@radial-pulse/shared-types';
import { describe, expect, it, vi } from 'vitest';
import { createSessionController, sessionFromMe, type SessionAdapter } from './session';

const me: MeResponse = {
  id: '7d9a2c4e-1f3b-4a5c-8d6e-2b1c0a9f8e71',
  email: 'priya.shah@radialpulse.example',
  full_name: 'Priya Shah',
  platform_role: 'digital_success_manager',
  permissions: ['clinics:create'],
  all_clinics: false,
  sign_in_method: 'google',
  clinics: [
    {
      clinic_id: 'c1b2a3d4-0000-4000-8000-000000000001',
      clinic_role: null,
      assigned: true,
      permissions: ['clinics:read', 'chat:read', 'chat:write'],
    },
  ],
};
const session = sessionFromMe(me);

describe('sessionFromMe', () => {
  it('maps the contract response to the shell session', () => {
    expect(session.user).toEqual({
      id: me.id,
      name: 'Priya Shah',
      email: me.email,
      platformRole: 'digital_success_manager',
      avatarUrl: null,
    });
    expect([...session.capabilities]).toEqual(['clinics:create']);
    expect(session.allClinics).toBe(false);
    const access = session.clinicAccess.get('c1b2a3d4-0000-4000-8000-000000000001');
    expect(access?.assigned).toBe(true);
    expect(access?.permissions.has('chat:write')).toBe(true);
  });

  it('falls back to the email when the name is not set', () => {
    expect(sessionFromMe({ ...me, full_name: null }).user.name).toBe(me.email);
  });
});

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
