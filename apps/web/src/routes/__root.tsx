import { createRootRoute, Outlet } from '@tanstack/react-router';

// Layout lives below: `_app` (authenticated shell) and `sign-in` (auth layout).
export const Route = createRootRoute({
  component: Outlet,
});
