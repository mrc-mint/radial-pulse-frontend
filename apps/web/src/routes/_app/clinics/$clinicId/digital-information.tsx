import { createFileRoute } from '@tanstack/react-router';
import { DigitalInformationPage } from '../../../../modules/clinics/digital-information-page';

export const Route = createFileRoute('/_app/clinics/$clinicId/digital-information')({
  component: DigitalInformationPage,
});
