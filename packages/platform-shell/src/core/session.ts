import type { AuthBridge } from '@radial-pulse/api-client';
import type { Capability, RoleName } from '@radial-pulse/shared-types';

/**
 * Session boundary (architecture: Auth, ADR 0006).
 *
 * The shell sees a session through a `SessionAdapter`. Phase 7 provides the
 * Cognito/Amplify adapter; until then the app supplies a development adapter.
 * Screens never see tokens: they read `useSession()` (user, tenant,
 * capabilities). Only the composition root hands `controller.authBridge`
 * to the API client.
 */

/** The shell's view of `GET /me`. Mapped from the contract once it is published. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roles: ReadonlyArray<RoleName>;
  avatarUrl?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
}

/** A clinic the user can act on. Clinic Administrators may have several. */
export interface ClinicSummary {
  id: string;
  name: string;
}

export interface Session {
  user: CurrentUser;
  tenant: Tenant;
  /** Capability strings from `GET /me`. UI affordances only; the backend enforces. */
  capabilities: ReadonlySet<Capability>;
  /** Clinics available to a Clinic Administrator. Absent for platform staff. */
  clinics?: ReadonlyArray<ClinicSummary>;
}

export interface SignInOption {
  id: string;
  label: string;
  description?: string;
}

export interface SessionAdapter {
  /** Restores an existing session (e.g. after reload); null when signed out. */
  restore(): Promise<Session | null>;
  /**
   * Starts sign-in. Redirect-based providers (Cognito managed login) navigate
   * away and resolve null; the session is then restored on return.
   */
  signIn(optionId?: string): Promise<Session | null>;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  /** Choices shown on the sign-in screen, if the provider offers any. */
  readonly signInOptions?: ReadonlyArray<SignInOption>;
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'authenticated'; session: Session }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: unknown };

export interface SessionController {
  getState(): SessionState;
  subscribe(listener: () => void): () => void;
  restore(): Promise<void>;
  signIn(optionId?: string): Promise<void>;
  signOut(): Promise<void>;
  readonly signInOptions: ReadonlyArray<SignInOption>;
  /** For the API client only (composition root). Never pass to screens. */
  readonly authBridge: AuthBridge;
}

/** Framework-free session store; React binds to it through SessionProvider. */
export function createSessionController(adapter: SessionAdapter): SessionController {
  let state: SessionState = { status: 'loading' };
  let restoring: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const set = (next: SessionState) => {
    state = next;
    listeners.forEach((l) => l());
  };
  const settle = (session: Session | null) =>
    set(session ? { status: 'authenticated', session } : { status: 'unauthenticated' });

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    restore() {
      // Idempotent while in flight (StrictMode, concurrent callers).
      restoring ??= adapter
        .restore()
        .then(settle, (error: unknown) => set({ status: 'error', error }))
        .finally(() => {
          restoring = null;
        });
      set({ status: 'loading' });
      return restoring;
    },
    async signIn(optionId) {
      set({ status: 'loading' });
      try {
        settle(await adapter.signIn(optionId));
      } catch (error) {
        set({ status: 'error', error });
      }
    },
    async signOut() {
      await adapter.signOut();
      set({ status: 'unauthenticated' });
    },
    signInOptions: adapter.signInOptions ?? [],
    authBridge: {
      getAccessToken: () => adapter.getAccessToken(),
      // A gateway 401 means the session is gone: return to sign-in.
      onUnauthorized: () => set({ status: 'unauthenticated' }),
    },
  };
}
