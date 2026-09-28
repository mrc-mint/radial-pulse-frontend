import type { Capability, Permission } from '@radial-pulse/shared-types';
import { can } from '@radial-pulse/utils';
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { hasClinicPermission, type ClinicPermissionSet } from './navigation';
import type { Session, SessionController, SessionState, SignInOption } from './session';

const SessionContext = createContext<SessionController | null>(null);

export function SessionProvider({
  controller,
  children,
}: {
  controller: SessionController;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={controller}>{children}</SessionContext.Provider>;
}

function useController(): SessionController {
  const controller = useContext(SessionContext);
  if (!controller) throw new Error('useSession must be used inside <SessionProvider>.');
  return controller;
}

export interface UseSession {
  state: SessionState;
  signIn: (optionId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
  signInOptions: ReadonlyArray<SignInOption>;
}

/** Session state and actions. Deliberately exposes no access token. */
export function useSession(): UseSession {
  const controller = useController();
  const state = useSyncExternalStore(controller.subscribe, controller.getState);
  return {
    state,
    signIn: controller.signIn,
    signOut: controller.signOut,
    retry: controller.restore,
    signInOptions: controller.signInOptions,
  };
}

/** The signed-in session. Use only inside authenticated routes. */
export function useCurrentSession(): Session {
  const { state } = useSession();
  if (state.status !== 'authenticated') {
    throw new Error('useCurrentSession requires an authenticated session.');
  }
  return state.session;
}

const EMPTY: ReadonlySet<Capability> = new Set();
const EMPTY_PERMISSIONS: ReadonlySet<Permission> = new Set();

export function useCapabilities(): ReadonlySet<Capability> {
  const { state } = useSession();
  return state.status === 'authenticated' ? state.session.capabilities : EMPTY;
}

/** UI-only capability check (hide/show). The backend remains the authority. */
export function useCan(capability: Capability | undefined): boolean {
  return can(useCapabilities(), capability);
}

export function Can({
  capability,
  children,
  fallback = null,
}: {
  capability: Capability;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{useCan(capability) ? children : fallback}</>;
}

/**
 * Permissions inside one clinic: from `MeResponse.clinics`, or `unrestricted`
 * for an `all_clinics` user (API 0.1.0 lists none for them). An empty set
 * means no access — the API will answer 404 for that clinic.
 */
export function useClinicPermissions(clinicId: string): ClinicPermissionSet {
  const { state } = useSession();
  if (state.status !== 'authenticated') return EMPTY_PERMISSIONS;
  const { session } = state;
  const access = session.clinicAccess.get(clinicId);
  if (access) return access.permissions;
  return session.allClinics ? 'unrestricted' : EMPTY_PERMISSIONS;
}

/** UI-only check of a permission inside a clinic. The API remains the authority. */
export function useClinicCan(clinicId: string, permission: Permission): boolean {
  return hasClinicPermission(useClinicPermissions(clinicId), permission);
}
