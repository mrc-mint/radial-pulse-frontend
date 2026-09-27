import { buttonClassName, PageHeader } from '@radial-pulse/ui/web';
import { Link } from '@tanstack/react-router';
import { ContractGap } from '../../app/page-kit';
import { useNavLabel } from '../../app/shell';

/**
 * Cross-clinic Audit Reports list. BLOCKED: API 0.1.0 lists assessments per
 * clinic only (GET /clinics/{clinic_id}/assessments). Tracked as a contract
 * gap; each clinic's reports are available in its Unified Audit section.
 */
export function AuditReportsPage() {
  const clinicsLabel = useNavLabel('clinics', 'Clinics');
  return (
    <div className="rp-page">
      <PageHeader
        title="Audit Reports"
        description="Digital Presence Assessments across your clinics"
        actions={
          <Link to="/clinics" className={buttonClassName({ variant: 'secondary' })}>
            Go to {clinicsLabel}
          </Link>
        }
      />
      <ContractGap
        title="A cross-clinic report list isn’t available yet"
        description="The API currently lists assessments per clinic. Open a clinic and choose Unified Audit to see its reports."
      />
    </div>
  );
}
