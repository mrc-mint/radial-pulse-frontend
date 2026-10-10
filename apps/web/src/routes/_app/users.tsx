import { RequireCapability } from '@radial-pulse/web-shell';
import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '@radial-pulse/studio-users';

export const Route = createFileRoute('/_app/users')({
  component: () => (
    <RequireCapability capability="users:read">
      <UsersPage />
    </RequireCapability>
  ),
});
