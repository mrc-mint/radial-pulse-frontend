import { createFileRoute } from '@tanstack/react-router';
import { AuditReportsPage } from '../../modules/assessments/audit-reports-page';

export const Route = createFileRoute('/_app/audit-reports')({
  component: AuditReportsPage,
});
