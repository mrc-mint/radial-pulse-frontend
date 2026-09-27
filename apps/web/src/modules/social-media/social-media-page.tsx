import { useConnections } from '@radial-pulse/api-client/react';
import { useClinicId } from '@radial-pulse/platform-shell/core';
import { Badge, Card, CONNECTION_STATUS_TONES, formatRelativeTime } from '@radial-pulse/ui/web';
import { CONNECTION_STATUS_LABELS } from '@radial-pulse/utils';
import { CardSkeleton, ContractGap, QueryError, Section } from '../../app/page-kit';
import './social-media.css';

/**
 * Social Media for one clinic. Connected accounts come from the contract
 * (`ConnectionRead`). Platform metrics are BLOCKED: API 0.1.0 stores them as
 * free-form `metric_key` snapshots without a published catalog, and the UI
 * does not invent metrics.
 */
export function SocialMediaPage() {
  const clinicId = useClinicId();
  const connections = useConnections(clinicId);

  return (
    <div className="rp-stack">
      <Section title="Connected accounts">
        {connections.isError ? (
          <Card>
            <QueryError error={connections.error} onRetry={() => void connections.refetch()} />
          </Card>
        ) : !connections.data ? (
          <CardSkeleton lines={3} />
        ) : (
          <ul className="rp-social__grid" aria-label="Connected accounts">
            {connections.data.map((c) => {
              const synced = c.last_synced_at ? formatRelativeTime(c.last_synced_at) : null;
              return (
                <li key={c.platform} className="rp-social__card">
                  <div className="rp-social__top">
                    <h3 className="rp-social__name">{c.label}</h3>
                    {c.available ? (
                      <Badge tone={CONNECTION_STATUS_TONES[c.status]} dot>
                        {CONNECTION_STATUS_LABELS[c.status]}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Coming later</Badge>
                    )}
                  </div>
                  {c.external_account_name && (
                    <p className="rp-social__account">{c.external_account_name}</p>
                  )}
                  <p className="rp-muted rp-small">
                    {synced
                      ? `Last synced ${synced}`
                      : c.available
                        ? 'The clinic connects this account from the mobile app.'
                        : 'This platform isn’t supported yet.'}
                  </p>
                  {c.last_error && (
                    <p className="rp-callout rp-callout--warning" role="note">
                      {c.last_error}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Performance">
        <ContractGap
          title="Social media metrics are coming"
          description="Followers, reach and engagement will appear here once the API publishes which metrics each platform provides."
        />
      </Section>
    </div>
  );
}
