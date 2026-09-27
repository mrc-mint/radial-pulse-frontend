import { createFileRoute } from '@tanstack/react-router';
import { ClinicOverviewPage } from '../../../../modules/clinics/overview-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/')({
  component: ClinicOverviewPage,
});
