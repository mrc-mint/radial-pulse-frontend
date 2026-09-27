import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '../../../app/page-placeholder';
import { useNavLabel } from '../../../app/shell';

export const Route = createFileRoute('/_app/clinics/')({
  component: ClinicsPage,
});

/** "Clinics" for Platform Administrators, "My Clinics" for Digital Success Managers. */
function ClinicsPage() {
  const title = useNavLabel('clinics', 'Clinics');
  return <PagePlaceholder title={title} description="Manage clinics and their progress" />;
}
