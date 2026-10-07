import { createFileRoute } from '@tanstack/react-router';
import { AssessmentsPage } from '../../modules/assessments/assessments-page';

export const Route = createFileRoute('/_app/assessments')({
  component: AssessmentsPage,
});
