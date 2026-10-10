import { buttonClassName, PageHeader } from '@radial-pulse/web-ui';
import { Link } from '@tanstack/react-router';
import { ContractGap } from '../../app/page-kit';
import { useNavLabel } from '../../app/shell';

/**
 * Digital Presence Assessments across client organizations. Not built yet:
 * contract 0.3.0 adds `GET /assessments` (dependency doc, gap 3). Until then
 * each client organization's assessments are in its own workspace.
 */
export function AssessmentsPage() {
  const clinicsLabel = useNavLabel('clinics', 'Client Organizations');
  return (
    <div className="rp-page">
      <PageHeader
        title="Digital Presence Assessments"
        description="Digital Presence Assessments across your client organizations"
        actions={
          <Link to="/clinics" className={buttonClassName({ variant: 'secondary' })}>
            Go to {clinicsLabel}
          </Link>
        }
      />
      <ContractGap
        title="The list across client organizations isn’t available yet"
        description="Open a client organization and choose Digital Presence Assessment to see its assessments."
      />
    </div>
  );
}
