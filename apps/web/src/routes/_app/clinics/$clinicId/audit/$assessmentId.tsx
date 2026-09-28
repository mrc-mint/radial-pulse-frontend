import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '../../../../../modules/assessments/audit-page';

/** Canonical report URL (architecture §6). */
export const Route = createFileRoute('/_app/clinics/$clinicId/audit/$assessmentId')({
  component: AssessmentRoute,
});

function AssessmentRoute() {
  const { assessmentId } = Route.useParams();
  return <AuditPage assessmentId={assessmentId} />;
}
