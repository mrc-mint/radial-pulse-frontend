import { createRootRoute, Outlet } from '@tanstack/react-router';
import { WebAppShell } from '@radial-pulse/platform-shell/web';

export const Route = createRootRoute({
  component: () => (
    <WebAppShell>
      <Outlet />
    </WebAppShell>
  ),
});
