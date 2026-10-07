import { createFileRoute, redirect } from '@tanstack/react-router';

/** Old URL: assessments moved to …/assessment/$assessmentId. */
export const Route = createFileRoute('/_app/clinics/$clinicId/audit/$assessmentId')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/clinics/$clinicId/assessment/$assessmentId', params, replace: true });
  },
});
