import type { AuthBridge } from '@radial-pulse/api-client';
import type {
  Capability,
  ClinicRole,
  MeResponse,
  Permission,
  PlatformRole,
} from '@radial-pulse/shared-types';

/**
 * Session boundary (architecture: Auth, ADR 0006, ADR 0008).
 *
 * The shell sees a session through a `SessionAdapter`. Phase 7 provides the
 * Cognito adapter; until then the app supplies a development adapter. The
 * session content always comes from the contract's `GET /api/v1/auth/me`
 * (`sessionFromMe`). Screens never see tokens: they read `useSession()`.
 * Only the composition root hands `controller.authBridge` to the API client.
 */

export interface CurrentUser {
  id: string;
  /** `full_name`, falling back to the email when the name is not set. */
  name: string;
  email: string;
  platformRole: PlatformRole;
  avatarUrl: string | null;
}

/** The caller's access inside one clinic (contract `ClinicAccess`). */
export interface ClinicPermissions {
  clinicRole: ClinicRole | null;
  /** The caller is this clinic's Digital Success Manager. */
  assigned: boolean;
  permissions: ReadonlySet<Permission>;
}

/** A clinic the user can act on (id + display name, from the clinics API). */
export interface ClinicSummary {
  id: string;
  name: string;
}

export interface Session {
  user: CurrentUser;
  /** Platform-level permissions (`MeResponse.permissions`). UI only; the backend enforces. */
  capabilities: ReadonlySet<Capability>;
  /**
   * `MeResponse.all_clinics`: the caller can reach every clinic (Platform
   * Administrator). API 0.1.0 then lists no per-clinic permissions.
   */
  allClinics: boolean;
  /** Per-clinic access, keyed by clinic id (`MeResponse.clinics`). */
  clinicAccess: ReadonlyMap<string, ClinicPermissions>;
}

/** Maps the contract's `MeResponse` to the shell session. */
export function sessionFromMe(me: MeResponse): Session {
  return {
    user: {
      id: me.id,
      name: me.full_name?.trim() || me.email,
      email: me.email,
      platformRole: me.platform_role,
      avatarUrl: me.avatar_url ?? null,
    },
    capabilities: new Set(me.permissions),
    allClinics: me.all_clinics,
    clinicAccess: new Map(
      me.clinics.map((c) => [
        c.clinic_id,
        {
          clinicRole: c.clinic_role ?? null,
          assigned: c.assigned ?? false,
          permissions: new Set(c.permissions),
        },
      ]),
    ),
  };
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
