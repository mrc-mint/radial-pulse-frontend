import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '../../../../../modules/assessments/audit-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/audit/')({
  component: () => <AuditPage />,
});
