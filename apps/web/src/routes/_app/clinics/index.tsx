import { createFileRoute } from '@tanstack/react-router';
import { ClinicsPage } from '../../../modules/clinics/clinics-page';

export const Route = createFileRoute('/_app/clinics/')({
  component: ClinicsPage,
});
