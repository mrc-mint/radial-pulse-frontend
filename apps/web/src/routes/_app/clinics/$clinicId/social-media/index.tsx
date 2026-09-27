import { createFileRoute } from '@tanstack/react-router';
import { ClinicSectionPlaceholder } from '../../../../../app/clinic-section-placeholder';

export const Route = createFileRoute('/_app/clinics/$clinicId/social-media/')({
  component: () => <ClinicSectionPlaceholder title="Social Media" />,
});
