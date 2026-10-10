import { createFileRoute } from '@tanstack/react-router';
import { ClinicActivityPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/$clinicId/activity')({
  component: ClinicActivityPage,
});
