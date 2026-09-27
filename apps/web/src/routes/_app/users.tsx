import { RequireCapability } from '@radial-pulse/platform-shell/web';
import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '../../modules/users/users-page';

export const Route = createFileRoute('/_app/users')({
  component: () => (
    <RequireCapability capability="users:read">
      <UsersPage />
    </RequireCapability>
  ),
});
