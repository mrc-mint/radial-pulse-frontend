import { createFileRoute } from '@tanstack/react-router';
import { ClinicOverviewPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/$clinicId/')({
  component: ClinicOverviewPage,
});
