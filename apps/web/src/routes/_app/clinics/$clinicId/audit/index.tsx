import { createFileRoute } from '@tanstack/react-router';
import { ClinicSectionPlaceholder } from '../../../../../app/clinic-section-placeholder';

export const Route = createFileRoute('/_app/clinics/$clinicId/audit/')({
  component: () => <ClinicSectionPlaceholder title="Unified Audit" />,
});
