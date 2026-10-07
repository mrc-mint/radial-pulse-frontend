import { createFileRoute, redirect } from '@tanstack/react-router';

/** Old URL: Digital Presence Assessments moved to /assessments. */
export const Route = createFileRoute('/_app/audit-reports')({
  beforeLoad: () => {
    throw redirect({ to: '/assessments', replace: true });
  },
});
