import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '../../app/page-placeholder';

export const Route = createFileRoute('/_app/audit-reports')({
  component: () => (
    <PagePlaceholder
      title="Audit Reports"
      description="View and manage audit reports for your clinics"
    />
  ),
});
