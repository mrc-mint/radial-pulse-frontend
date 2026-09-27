import type { AppConfig } from '@radial-pulse/config';
import type { Session, SessionAdapter } from '@radial-pulse/platform-shell/core';
import { CAPABILITIES } from '../capabilities';

/**
 * DEVELOPMENT SESSION ADAPTER — stands in for Cognito managed login until
 * Phase 7 (ADR 0006, ADR 0008). No passwords, no tokens: the user picks a
 * persona. It refuses to run in prod, and nothing outside this file knows it
 * exists — the shell sees only the SessionAdapter interface.
 */

export const DEV_PERSONA_IDS = ['platform-administrator', 'digital-success-manager'] as const;
export type DevPersonaId = (typeof DEV_PERSONA_IDS)[number];

const TENANT = { id: 'tenant_radial_pulse', name: 'Radial Pulse' };

const PERSONAS: Record<DevPersonaId, { label: string; description: string; session: Session }> = {
  'platform-administrator': {
    label: 'Platform Administrator',
    description: 'All clinics, users, audit reports and settings.',
    session: {
      user: {
        id: 'usr_rohan_agarwal',
        name: 'Rohan Agarwal',
        email: 'rohan.agarwal@radialpulse.example',
        roles: ['PLATFORM_ADMINISTRATOR'],
      },
      tenant: TENANT,
      capabilities: new Set([CAPABILITIES.manageUsers]),
    },
  },
  'digital-success-manager': {
    label: 'Digital Success Manager',
    description: 'Assigned clinics, their audit reports and chats.',
    session: {
      user: {
        id: 'usr_priya_shah',
        name: 'Priya Shah',
        email: 'priya.shah@radialpulse.example',
        roles: ['DIGITAL_SUCCESS_MANAGER'],
      },
      tenant: TENANT,
      capabilities: new Set([CAPABILITIES.assignedClinicsOnly]),
    },
  },
};

const STORAGE_KEY = 'rp.dev-session.persona';

const isPersona = (value: unknown): value is DevPersonaId =>
  DEV_PERSONA_IDS.includes(value as DevPersonaId);

/** Tab-scoped like the real web session (ADR 0006); tolerant of blocked storage. */
function createPersonaStore(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null) {
  return {
    get(): DevPersonaId | null {
      try {
        const value = storage?.getItem(STORAGE_KEY);
        return isPersona(value) ? value : null;
      } catch {
        return null;
      }
    },
    set(id: DevPersonaId | null) {
      try {
        if (id) storage?.setItem(STORAGE_KEY, id);
        else storage?.removeItem(STORAGE_KEY);
      } catch {
        // Storage unavailable: the session simply won't survive a reload.
      }
    },
  };
}

function defaultStorage() {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function createDevSessionAdapter(
  config: Pick<AppConfig, 'appEnv'>,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = defaultStorage(),
): SessionAdapter {
  if (config.appEnv === 'prod') {
    throw new Error(
      'The development session adapter cannot run in prod. Configure Cognito managed login (Phase 7).',
    );
  }
  const store = createPersonaStore(storage);
  const sessionFor = (id: DevPersonaId | null) => (id ? PERSONAS[id].session : null);

  return {
    signInOptions: DEV_PERSONA_IDS.map((id) => ({
      id,
      label: PERSONAS[id].label,
      description: PERSONAS[id].description,
    })),
    async restore() {
      return sessionFor(store.get());
    },
    async signIn(optionId) {
      const id: DevPersonaId = isPersona(optionId) ? optionId : 'platform-administrator';
      store.set(id);
      return sessionFor(id);
    },
    async signOut() {
      store.set(null);
    },
    // No API calls are made before Phase 4; there is no token to give.
    async getAccessToken() {
      return null;
    },
  };
}
