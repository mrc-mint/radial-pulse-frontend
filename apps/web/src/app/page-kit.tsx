import { isApiError } from '@radial-pulse/api-client';
import { Card, EmptyState, ErrorState, Skeleton } from '@radial-pulse/ui/web';
import { Unplug } from 'lucide-react';
import type { ReactNode } from 'react';
import './page-kit.css';

/**
 * Small building blocks shared by the web pages (app-level, not a design
 * system concern): API error display, contract-gap notices and layout.
 */

/** ErrorState for a failed query or mutation, quoting the request id for support. */
export function QueryError({
  error,
  onRetry,
  title,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const api = isApiError(error) ? error : null;
  return (
    <ErrorState
      title={title ?? (api?.kind === 'not_found' ? 'Not found' : undefined)}
      description={api?.message}
      requestId={api?.requestId}
      onRetry={api?.kind === 'not_found' || api?.kind === 'forbidden' ? undefined : onRetry}
    />
  );
}

/** Message for a mutation failure, shown next to the control that failed. */
export function mutationErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return isApiError(error) ? error.message : 'Something went wrong. Please try again.';
}

/** Field errors from a 422, keyed by field name. */
export function fieldErrors(error: unknown): Readonly<Record<string, string[]>> {
  return (isApiError(error) && error.fieldErrors) || {};
}

/**
 * Shown where a screen needs data the API contract does not provide yet. The
 * UI never invents the missing data; the gap is tracked in
 * docs/phase-4-contract-dependency.md.
 */
export function ContractGap({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <EmptyState
        variant="page"
        icon={<Unplug size={22} />}
        title={title}
        description={description}
      />
    </Card>
  );
}

export function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rp-section">
      <div className="rp-section__header">
        <h2 className="rp-section__title">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function DefinitionList({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <dl className="rp-deflist">
      {items.map(([term, value]) => (
        <div key={term} className="rp-deflist__row">
          <dt>{term}</dt>
          <dd>{value ?? <span className="rp-muted">Not provided</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <Card aria-busy="true">
      <div className="rp-stack-sm">
        <Skeleton width="40%" height={18} />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} width={`${90 - i * 12}%`} />
        ))}
      </div>
    </Card>
  );
}

/** Google Maps link from the clinic's contract coordinates (or its address). */
export function mapsUrl(clinic: {
  latitude: number | null;
  longitude: number | null;
  name: string;
  address_line?: string | null;
  city: string | null;
}): string | null {
  if (clinic.latitude !== null && clinic.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`;
  }
  const place = [clinic.name, clinic.address_line, clinic.city].filter(Boolean).join(', ');
  return place
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
    : null;
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="rp-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="rp-sr-only"> (opens in a new tab)</span>
    </a>
  );
}
