import {
  ClinicScopeProvider,
  resolveClinicSections,
  useClinicPermissions,
  useCurrentSession,
} from '@radial-pulse/shell-core';
import { ClinicWorkspace } from '@radial-pulse/web-shell';
import { useChatInbox } from '@radial-pulse/api-client-react';
import { buttonClassName } from '@radial-pulse/web-ui';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { webModules } from '../../../app/module-registry';
import { renderShellLink, usePathname } from '../../../app/shell';
import { useNavLabel } from '@radial-pulse/studio-kit';
import { STUDIO_FEATURES } from '@radial-pulse/studio-kit';
import { ClinicHeader } from '@radial-pulse/studio-clinics';

/**
 * Clinic workspace: every route below /clinics/$clinicId runs inside this
 * clinic's scope (useClinicId()). Digital Success Managers reach it from
 * My Client Portfolio; access to the clinic itself is enforced by the API.
 */
export const Route = createFileRoute('/_app/clinics/$clinicId')({
  component: ClinicLayout,
});

function ClinicLayout() {
  const { clinicId } = Route.useParams();
  const permissions = useClinicPermissions(clinicId);
  // Platform Administrators don't chat with clinics; the clinic's DSM does.
  // Client Collaboration is V2 (STUDIO_FEATURES): no polling, badge or section.
  const allClinics = useCurrentSession().allClinics;
  const chats = STUDIO_FEATURES.clientCollaboration && !allClinics;
  const pathname = usePathname();
  const backLabel = useNavLabel('clinics', 'Client Organizations');
  // Slow poll for the Chat tab's unread badge; the chat itself polls faster.
  const inbox = useChatInbox({
    enabled: chats && (permissions === 'unrestricted' || permissions.has('chat:read')),
  });
  const unread = inbox.data?.items.find((t) => t.clinic_id === clinicId)?.unread_count ?? 0;
  const sections = useMemo(
    () =>
      resolveClinicSections(webModules, permissions, clinicId).filter(
        (s) => chats || s.id !== 'chat',
      ),
    [permissions, clinicId, chats],
  );

  return (
    // Keyed so no clinic-scoped state survives a switch to another clinic.
    <ClinicScopeProvider key={clinicId} clinicId={clinicId}>
      <ClinicWorkspace
        sections={sections}
        pathname={pathname}
        renderLink={renderShellLink}
        badges={{ chat: { count: unread, label: 'unread messages' } }}
        header={
          <ClinicHeader
            clinicId={clinicId}
            back={
              <Link
                to="/clinics"
                className={buttonClassName({ variant: 'ghost', size: 'sm' })}
                aria-label={`Back to ${backLabel}`}
                title={`Back to ${backLabel}`}
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
