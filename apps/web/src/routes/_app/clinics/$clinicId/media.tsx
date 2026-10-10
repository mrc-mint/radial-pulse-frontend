import { createFileRoute } from '@tanstack/react-router';
import { ClinicMediaPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/$clinicId/media')({
  component: ClinicMediaPage,
});
