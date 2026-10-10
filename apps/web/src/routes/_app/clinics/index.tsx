import { createFileRoute } from '@tanstack/react-router';
import { ClinicsPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/')({
  component: ClinicsPage,
});
