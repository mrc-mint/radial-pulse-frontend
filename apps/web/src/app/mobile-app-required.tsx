import { AuthLayout } from '@radial-pulse/platform-shell/web';
import { Button, Card, EmptyState } from '@radial-pulse/ui/web';
import { Smartphone } from 'lucide-react';

/**
 * The web portal is for Platform Administrators and Digital Success Managers
 * (docs/scope-v1.md). Clinic accounts sign in here only by mistake: they get
 * this screen, never the internal navigation or any clinic data.
 */
export function MobileAppRequired({ onSignOut }: { onSignOut: () => void }) {
  return (
    <AuthLayout>
      <Card padding="lg">
        <EmptyState
          variant="page"
          icon={<Smartphone size={22} />}
          title="Use the Radial Pulse mobile app"
          description="Clinic Administrators use the Radial Pulse mobile app to see their clinic’s insights and assessments and chat with their Digital Success Manager. This web portal is for the Radial Pulse team."
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
