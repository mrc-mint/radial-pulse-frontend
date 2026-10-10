import { createFileRoute } from '@tanstack/react-router';
import { DigitalInformationPage } from '@radial-pulse/studio-clinics';

export const Route = createFileRoute('/_app/clinics/$clinicId/digital-information')({
  component: DigitalInformationPage,
});
