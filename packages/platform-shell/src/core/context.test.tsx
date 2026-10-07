// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ClinicScopeProvider,
  ClinicSelectionProvider,
  resolveSelectedClinic,
  useClinicId,
  useClinicSelection,
  useOptionalClinicId,
} from './clinic-context';
import type { MeResponse } from '@radial-pulse/shared-types';
import { createSessionController, sessionFromMe } from './session';
import {
  Can,
  SessionProvider,
  useCan,
  useClinicCan,
  useClinicPermissions,
  useSession,
} from './session-context';

afterEach(cleanup);

const clinics = [
  { id: 'c_smile', name: 'Smile Dental Care' },
  { id: 'c_bright', name: 'Bright Smile Clinic' },
];

describe('resolveSelectedClinic', () => {
  it('keeps a requested clinic the user can access', () => {
    expect(resolveSelectedClinic(clinics, 'c_bright')?.id).toBe('c_bright');
  });

  it('falls back to the first clinic when access was removed', () => {
    expect(resolveSelectedClinic(clinics, 'c_gone')?.id).toBe('c_smile');
  });

  it('is null when the user has no clinics', () => {
    expect(resolveSelectedClinic([], 'c_smile')).toBeNull();
  });
});

describe('clinic scope', () => {
  it('provides the clinicId to clinic-scoped screens', () => {
    const { result } = renderHook(() => useClinicId(), {
      wrapper: ({ children }) => (
        <ClinicScopeProvider clinicId="c_smile">{children}</ClinicScopeProvider>
      ),
    });
    expect(result.current).toBe('c_smile');
  });

  it('refuses to render a clinic-scoped screen outside a clinic', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useClinicId())).toThrow(/clinic scope/);
    expect(renderHook(() => useOptionalClinicId()).result.current).toBeNull();
  });
});

describe('ClinicSelectionProvider', () => {
  const wrapper =
    (list: typeof clinics, onChange?: (id: string) => void) =>
    ({ children }: { children: ReactNode }) => (
      <ClinicSelectionProvider clinics={list} onChange={onChange}>
        {children}
      </ClinicSelectionProvider>
    );
  const useBoth = () => ({ selection: useClinicSelection(), scoped: useOptionalClinicId() });

  it('hides the switcher for a single clinic and scopes to it', () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper([clinics[0]!]) });
    expect(result.current.selection.hasMultipleClinics).toBe(false);
    expect(result.current.scoped).toBe('c_smile');
  });

  it('switches the scoped clinic and reports the change', () => {
    const onChange = vi.fn();
    const { result } = renderHook(useBoth, { wrapper: wrapper(clinics, onChange) });
    expect(result.current.selection.hasMultipleClinics).toBe(true);
    act(() => result.current.selection.selectClinic('c_bright'));
    expect(result.current.scoped).toBe('c_bright');
    expect(onChange).toHaveBeenCalledWith('c_bright');
  });

  it('ignores clinics the user cannot access', () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper(clinics) });
    act(() => result.current.selection.selectClinic('c_other_tenant'));
    expect(result.current.scoped).toBe('c_smile');
  });

  it('provides no clinic scope when the user has no clinics', () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper([]) });
    expect(result.current.selection.selectedClinic).toBeNull();
    expect(result.current.scoped).toBeNull();
  });
});

describe('capabilities', () => {
  async function withSession(me: Partial<MeResponse> = {}) {
    const session = sessionFromMe({
      id: 'u-1',
      email: 'rohan.agarwal@radialpulse.example',
      full_name: 'Rohan Agarwal',
      platform_role: 'platform_administrator',
      permissions: ['users:read', 'users:manage'],
      all_clinics: true,
      sign_in_method: 'email_password',
      clinics: [],
      ...me,
    });
    const controller = createSessionController({
      restore: async () => session,
      signIn: async () => session,
      signOut: async () => {},
      getAccessToken: async () => 'secret',
    });
    await controller.restore();
    return ({ children }: { children: ReactNode }) => (
      <SessionProvider controller={controller}>{children}</SessionProvider>
    );
  }

  it('answers platform permission checks from the session', async () => {
    const wrapper = await withSession();
    const { result } = renderHook(() => [useCan('users:manage'), useCan('settings:manage')], {
      wrapper,
    });
    expect(result.current).toEqual([true, false]);
  });

  it('renders gated content only when the permission is held', async () => {
    const Wrapper = await withSession();
    render(
      <Wrapper>
        <Can capability="users:manage">
          <p>Manage users</p>
        </Can>
        <Can capability="settings:manage" fallback={<p>Hidden</p>}>
          <p>Settings</p>
        </Can>
      </Wrapper>,
    );
    expect(screen.getByText('Manage users')).toBeTruthy();
    expect(screen.getByText('Hidden')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('checks permissions inside a clinic from the clinic access list', async () => {
    const wrapper = await withSession({
      platform_role: 'digital_success_manager',
      all_clinics: false,
      permissions: ['clinics:create'],
      clinics: [{ clinic_id: 'c-1', assigned: true, permissions: ['chat:read'] }],
    });
    const { result } = renderHook(
      () => [
        useClinicCan('c-1', 'chat:read'),
        useClinicCan('c-1', 'chat:write'),
        useClinicCan('c-2', 'chat:read'),
      ],
      { wrapper },
    );
    expect(result.current).toEqual([true, false, false]);
  });

  it('treats an all-clinics user without per-clinic permissions as unrestricted', async () => {
    const wrapper = await withSession();
    const { result } = renderHook(() => useClinicPermissions('any-clinic'), { wrapper });
    expect(result.current).toBe('unrestricted');
  });

  it('never exposes the access token to screens', async () => {
    const wrapper = await withSession();
    const { result } = renderHook(() => useSession(), { wrapper });
    expect(JSON.stringify(Object.keys(result.current))).not.toMatch(/token/i);
  });
});
