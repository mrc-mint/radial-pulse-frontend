import type { Capability } from '@radial-pulse/shared-types';
import { Card, EmptyState, ErrorState, LoadingState } from '@radial-pulse/ui/web';
import { Compass, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCan } from '../core';
import './states.css';

/** Centered status for boot-time states (session restore, sign-in errors). */
export function FullPageStatus({ children }: { children: ReactNode }) {
  return <div className="rp-full-page">{children}</div>;
}

export function FullPageLoading({ label = 'Loading Radial Pulse…' }: { label?: string }) {
  return (
    <FullPageStatus>
      <LoadingState label={label} variant="page" />
    </FullPageStatus>
  );
}

export function FullPageError({
  title,
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <FullPageStatus>
      <Card>
        <ErrorState title={title} description={description} onRetry={onRetry} variant="page" />
      </Card>
    </FullPageStatus>
  );
}

export function AccessDenied({ action }: { action?: ReactNode }) {
  return (
    <Card>
      <EmptyState
        variant="page"
        icon={<ShieldAlert size={22} />}
        title="You don’t have access to this page"
        description="Your role doesn’t include this area of Radial Pulse. If you think this is a mistake, contact your Platform Administrator."
        action={action}
      />
    </Card>
  );
}

export function NotFound({ action }: { action?: ReactNode }) {
  return (
    <Card>
      <EmptyState
        variant="page"
        icon={<Compass size={22} />}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or may have moved."
        action={action}
      />
    </Card>
  );
}

/**
 * Renders children only when the user holds the capability. A UX guard: the
 * backend still rejects the underlying API calls.
 */
export function RequireCapability({
  capability,
  children,
}: {
  capability: Capability;
  children: ReactNode;
}) {
  return useCan(capability) ? <>{children}</> : <AccessDenied />;
}
