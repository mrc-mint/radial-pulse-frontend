import { createFileRoute } from '@tanstack/react-router';
import { AssessmentPage } from '@radial-pulse/studio-assessments';

export const Route = createFileRoute('/_app/clinics/$clinicId/assessment/')({
  component: () => <AssessmentPage />,
});
