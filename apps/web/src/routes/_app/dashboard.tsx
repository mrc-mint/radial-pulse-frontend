import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '../../app/page-placeholder';

export const Route = createFileRoute('/_app/dashboard')({
  component: () => (
    <PagePlaceholder title="Dashboard" description="Overview of clinics, progress and impact" />
  ),
});
