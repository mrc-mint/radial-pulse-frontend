import type { AppEnv } from '@radial-pulse/config';
import { resolveNavigation, useSession } from '@radial-pulse/platform-shell/core';
import type { RenderLink } from '@radial-pulse/platform-shell/web';
import { Link, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { webModules } from './module-registry';

/**
 * Binds the router-agnostic shell to TanStack Router. Targets come from
 * module manifests as plain paths, hence the cast: they are validated by the
 * route tree at runtime and by the shell tests.
 *
 * The shell owns active state (aria-current "page" vs "true" for an
 * ancestor section), so the router only marks exact matches — otherwise it
 * would stamp aria-current="page" on every ancestor link.
 */
export const renderShellLink: RenderLink = ({ to, children, ...rest }) => (
  <Link
    to={to as never}
    activeOptions={{ exact: true, includeSearch: false }}
    activeProps={{}}
    {...rest}
  >
    {children}
  </Link>
);

export function usePathname(): string {
  return useRouterState({ select: (s) => s.location.pathname });
}

/** Sidebar entries for the signed-in user. */
export function useAppNavigation() {
  const { state } = useSession();
  const session = state.status === 'authenticated' ? state.session : null;
  return useMemo(
    () =>
      session
        ? resolveNavigation(webModules, session.capabilities, { allClinics: session.allClinics })
        : [],
    [session],
  );
}

/** The label the current user sees for a nav entry (e.g. "My Clinics"). */
export function useNavLabel(id: string, fallback: string): string {
  return useAppNavigation().find((e) => e.id === id)?.label ?? fallback;
}

export function environmentLabel(env: AppEnv): string | null {
  if (env === 'prod') return null;
  return env === 'local' ? 'Local' : 'Dev';
}
