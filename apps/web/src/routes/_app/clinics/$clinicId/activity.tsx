import { createFileRoute } from '@tanstack/react-router';
import { ClinicActivityPage } from '../../../../modules/clinics/activity-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/activity')({
  component: ClinicActivityPage,
});
