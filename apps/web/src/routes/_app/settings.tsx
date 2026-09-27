import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '../../app/page-placeholder';

export const Route = createFileRoute('/_app/settings')({
  component: () => (
    <PagePlaceholder title="Settings" description="Manage system settings and preferences" />
  ),
});
