import { createFileRoute } from '@tanstack/react-router';
import { AssessmentPage } from '../../../../../modules/assessments/assessment-page';

/** Canonical Digital Presence Assessment URL (architecture §6). */
export const Route = createFileRoute('/_app/clinics/$clinicId/assessment/$assessmentId')({
  component: AssessmentRoute,
});

function AssessmentRoute() {
  const { assessmentId } = Route.useParams();
  return <AssessmentPage assessmentId={assessmentId} />;
}
