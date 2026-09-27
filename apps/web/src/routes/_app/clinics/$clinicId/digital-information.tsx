import { createFileRoute } from '@tanstack/react-router';
import { ClinicSectionPlaceholder } from '../../../../app/clinic-section-placeholder';

export const Route = createFileRoute('/_app/clinics/$clinicId/digital-information')({
  component: () => <ClinicSectionPlaceholder title="Digital Information" />,
});
