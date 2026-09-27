import {
  clinicAdministratorClinicIds,
  ClinicSelectionProvider,
  productExperience,
  useSession,
  type ClinicSummary,
  type Session,
} from '@radial-pulse/platform-shell/core';
import { FullScreenLoading, FullScreenMessage } from '@radial-pulse/platform-shell/native';
import { Button } from '@radial-pulse/ui/native';
import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAccessibleClinics } from './clinic-data';
import { deviceStorage } from './device-storage';
import { mutationErrorMessage } from './kit';

/**
 * Entry to the signed-in app. Route protection is a UX boundary only: the API
 * (Cognito authorizer + FastAPI + RLS) enforces access.
 *
 *   signed out                      → Welcome
 *   Platform Administrator / DSM    → "use the web portal"
 *   no Clinic Administrator clinic  → "no clinic access"
 *   Clinic Administrator            → the app, scoped to the selected clinic
 */
export function ClinicAdministratorGate({ children }: { children: ReactNode }) {
  const { state, signOut, retry } = useSession();

  if (state.status === 'loading') return <FullScreenLoading />;
  if (state.status === 'unauthenticated') return <Redirect href="/welcome" />;
  if (state.status === 'error') {
    return (
      <FullScreenMessage
        title="We couldn’t restore your session"
        description="Check your connection and try again."
        actions={
          <>
            <Button onPress={() => void retry()} fullWidth>
              Try again
            </Button>
            <Button variant="ghost" onPress={() => void signOut()} fullWidth>
              Sign out
            </Button>
          </>
        }
      />
    );
  }

  const signOutButton = (
    <Button variant="secondary" onPress={() => void signOut()} fullWidth>
      Sign out
    </Button>
  );

  switch (productExperience(state.session)) {
    case 'internal-web':
      return (
        <FullScreenMessage
          title="Use the Radial Pulse web portal"
          description="This app is for Clinic Administrators. Platform Administrators and Digital Success Managers work in the Radial Pulse web portal."
          actions={signOutButton}
        />
      );
    case 'unsupported':
      return <NoClinicAccess action={signOutButton} />;
    case 'clinic-administrator-mobile':
      return (
        <ClinicSelection
          session={state.session}
          fallback={<NoClinicAccess action={signOutButton} />}
        >
          {children}
        </ClinicSelection>
      );
  }
}

function NoClinicAccess({ action }: { action: ReactNode }) {
  return (
    <FullScreenMessage
      title="No clinic access yet"
      description="Your account isn’t set up as a Clinic Administrator for any clinic. Please contact your Digital Success Manager."
      actions={action}
    />
  );
}

/**
 * Loads the clinics this person administers and provides the selected one.
 * Every clinic-scoped query below reads it through `useClinicId()`, and the
 * selection provider remounts the tree on a switch, so no clinic's state
 * survives into another.
 */
function ClinicSelection({
  session,
  fallback,
  children,
}: {
  session: Session;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const userId = session.user.id;
  const adminIds = clinicAdministratorClinicIds(session).join(',');
  const clinics = useAccessibleClinics();
  const [initialId, setInitialId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void deviceStorage.getSelectedClinic(userId).then((id) => active && setInitialId(id));
    return () => {
      active = false;
    };
  }, [userId]);

  const summaries = useMemo<ClinicSummary[]>(() => {
    const allowed = new Set(adminIds.split(','));
    return (clinics.data?.items ?? [])
      .filter((c) => allowed.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
  }, [clinics.data, adminIds]);

  if (clinics.isLoading || initialId === undefined) {
    return <FullScreenLoading label="Loading your clinic…" />;
  }
  if (clinics.error) {
    return (
      <FullScreenMessage
        title="We couldn’t load your clinic"
        description={mutationErrorMessage(clinics.error) ?? undefined}
        actions={
          <Button onPress={() => void clinics.refetch()} fullWidth>
            Try again
          </Button>
        }
      />
    );
  }
  if (summaries.length === 0) return fallback;

  return (
    <ClinicSelectionProvider
      clinics={summaries}
      initialClinicId={initialId}
      onChange={(clinicId) => deviceStorage.setSelectedClinic(userId, clinicId)}
    >
      {children}
    </ClinicSelectionProvider>
  );
}
