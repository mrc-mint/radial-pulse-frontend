import { createFileRoute } from '@tanstack/react-router';
import { ClinicMediaPage } from '../../../../modules/clinics/media-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/media')({
  component: ClinicMediaPage,
});
