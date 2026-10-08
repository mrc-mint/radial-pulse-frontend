import { AuthLayout } from '@radial-pulse/platform-shell/web';
import { Button, Card, EmptyState } from '@radial-pulse/ui/web';
import { Building2 } from 'lucide-react';

/**
 * Studio is for Platform Administrators and Digital Success Managers
 * (docs/scope-v1.md). Clinic accounts are not supported in V1: the app for
 * clinics (Clinic) is V2. A clinic account that signs in here gets only this
 * screen and sign-out, never the internal navigation or any clinic data.
 */
export function ClinicAccountBlocked({ onSignOut }: { onSignOut: () => void }) {
  return (
    <AuthLayout>
      <Card padding="lg">
        <EmptyState
          variant="page"
          icon={<Building2 size={22} />}
          title="Clinic accounts can’t use Radial Pulse Studio"
          description="Studio is for the Radial Pulse team. Access for clinics is planned for a later release. Until then, contact your Digital Success Manager for anything about your clinic."
          action={
            <Button variant="secondary" onClick={onSignOut}>
              Sign out
            </Button>
          }
        />
      </Card>
    </AuthLayout>
  );
}
