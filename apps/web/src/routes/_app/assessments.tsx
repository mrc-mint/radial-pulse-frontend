import { createFileRoute } from '@tanstack/react-router';
import { AssessmentsPage } from '@radial-pulse/studio-assessments';

export const Route = createFileRoute('/_app/assessments')({
  component: AssessmentsPage,
});
