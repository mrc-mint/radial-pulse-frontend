import { createFileRoute, redirect } from '@tanstack/react-router';

/** Old URL: a client organization's assessment moved to …/assessment. */
export const Route = createFileRoute('/_app/clinics/$clinicId/audit/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/clinics/$clinicId/assessment', params, replace: true });
  },
});
