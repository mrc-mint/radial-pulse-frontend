import { roleLabel, useConfig, useSession } from '@radial-pulse/platform-shell/core';
import { FullPageError, FullPageLoading, WebAppShell } from '@radial-pulse/platform-shell/web';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
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

  const { user } = state.session;
  return (
    <WebAppShell
      nav={nav}
      pathname={pathname}
      renderLink={renderShellLink}
      user={{ name: user.name, roleLabel: roleLabel(user.roles), avatarUrl: user.avatarUrl }}
      onSignOut={() => void signOut()}
      environmentLabel={environmentLabel(config.appEnv)}
    >
      <Outlet />
    </WebAppShell>
  );
}
