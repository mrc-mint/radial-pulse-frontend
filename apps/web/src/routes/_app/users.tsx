import { RequireCapability } from '@radial-pulse/platform-shell/web';
import { createFileRoute } from '@tanstack/react-router';
import { CAPABILITIES } from '../../app/capabilities';
import { PagePlaceholder } from '../../app/page-placeholder';

export const Route = createFileRoute('/_app/users')({
  component: () => (
    <RequireCapability capability={CAPABILITIES.manageUsers}>
      <PagePlaceholder title="Users" description="Manage platform users and their access" />
    </RequireCapability>
  ),
});
