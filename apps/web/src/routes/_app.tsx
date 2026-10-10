import { productExperience, roleLabel } from '@radial-pulse/auth';
import { useConfig, useSession } from '@radial-pulse/shell-core';
import { FullPageError, FullPageLoading, WebAppShell } from '@radial-pulse/web-shell';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ClinicAccountBlocked } from '../app/clinic-account-blocked';
import { environmentLabel, renderShellLink, useAppNavigation, usePathname } from '../app/shell';

/**
 * Authenticated area. Route protection is a UX boundary only: the API
 * (Cognito authorizer + FastAPI + RLS) enforces access.
 */
export const Route = createFileRoute('/_app')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { state, signOut, retry } = useSession();
  const config = useConfig();
  const pathname = usePathname();
  const router = useRouter();
  const nav = useAppNavigation();

  // Redirect once per sign-out, capturing where the user was. (Rendering
  // <Navigate> here would re-fire during the transition with the sign-in URL
  // itself as the destination.)
  useEffect(() => {
    const { pathname: current, href } = router.state.location;
    // StrictMode re-runs effects; by then we may already be on sign-in.
    if (state.status !== 'unauthenticated' || current === '/sign-in') return;
    const redirect = href;
    void router.navigate({ to: '/sign-in', search: { redirect }, replace: true });
  }, [state.status, router]);

  if (state.status === 'loading' || state.status === 'unauthenticated') {
    return <FullPageLoading />;
  }
  if (state.status === 'error') {
    return (
      <FullPageError
        title="We couldn’t restore your session"
        description="Check your connection and try again."
        onRetry={() => void retry()}
      />
    );
  }

  // Clinic accounts are not supported in V1 (Clinic is V2): Studio is never
  // rendered for them, only a clear message and sign-out.
  if (productExperience(state.session) !== 'internal-web') {
    return <ClinicAccountBlocked onSignOut={() => void signOut()} />;
  }

  const { user } = state.session;
  return (
    <WebAppShell
      nav={nav}
      pathname={pathname}
      renderLink={renderShellLink}
      user={{ name: user.name, roleLabel: roleLabel(user.platformRole), avatarUrl: user.avatarUrl }}
      onSignOut={() => void signOut()}
      environmentLabel={environmentLabel(config.appEnv)}
    >
      <Outlet />
    </WebAppShell>
  );
}
