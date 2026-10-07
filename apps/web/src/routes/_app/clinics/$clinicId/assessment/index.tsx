import { createFileRoute } from '@tanstack/react-router';
import { AssessmentPage } from '../../../../../modules/assessments/assessment-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/assessment/')({
  component: () => <AssessmentPage />,
});
