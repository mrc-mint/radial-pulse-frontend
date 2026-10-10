import { FullPageStatus, NotFound } from '@radial-pulse/web-shell';
import { buttonClassName } from '@radial-pulse/web-ui';
import { createRouter, Link, type RouterHistory } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';

function RootNotFound() {
  return (
    <FullPageStatus>
      <NotFound
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
            Go to Dashboard
          </Link>
        }
      />
    </FullPageStatus>
  );
}

/** One factory for the app and for tests (which pass a memory history). */
export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    history,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: RootNotFound,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
