import { RequireCapability } from '@radial-pulse/web-shell';
import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '../../modules/users/users-page';

export const Route = createFileRoute('/_app/users')({
  component: () => (
    <RequireCapability capability="users:read">
      <UsersPage />
    </RequireCapability>
  ),
});
