import {
  ClinicScopeProvider,
  resolveClinicSections,
  useCapabilities,
} from '@radial-pulse/platform-shell/core';
import { ClinicWorkspace } from '@radial-pulse/platform-shell/web';
import { buttonClassName, PageHeader } from '@radial-pulse/ui/web';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { webModules } from '../../../app/module-registry';
import { renderShellLink, useNavLabel, usePathname } from '../../../app/shell';

/**
 * Clinic workspace: every route below /clinics/$clinicId runs inside this
 * clinic's scope (useClinicId()). Digital Success Managers reach it from
 * My Clinics; access to the clinic itself is enforced by the API.
 */
export const Route = createFileRoute('/_app/clinics/$clinicId')({
  component: ClinicLayout,
});

function ClinicLayout() {
  const { clinicId } = Route.useParams();
  const capabilities = useCapabilities();
  const pathname = usePathname();
  const backLabel = useNavLabel('clinics', 'Clinics');
  const sections = useMemo(
    () => resolveClinicSections(webModules, capabilities, clinicId),
    [capabilities, clinicId],
  );

  return (
    // Keyed so no clinic-scoped state survives a switch to another clinic.
    <ClinicScopeProvider key={clinicId} clinicId={clinicId}>
      <ClinicWorkspace
        sections={sections}
        pathname={pathname}
        renderLink={renderShellLink}
        header={
          // Placeholder header: the clinics module renders name, status and
          // actions from the clinic contract in the next phase.
          <PageHeader
            title="Clinic workspace"
            description={`Clinic ${clinicId}`}
            back={
              <Link
                to="/clinics"
                className={buttonClassName({ variant: 'ghost', size: 'sm' })}
                aria-label={`Back to ${backLabel}`}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            }
          />
        }
      >
        <Outlet />
      </ClinicWorkspace>
    </ClinicScopeProvider>
  );
}
