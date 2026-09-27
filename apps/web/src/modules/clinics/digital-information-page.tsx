import { usePresenceProfiles, useUpdatePresenceProfile } from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Badge,
  Button,
  Card,
  displayHost,
  EmptyState,
  formatDateTime,
  PRESENCE_VERIFICATION_TONES,
  Tabs,
} from '@radial-pulse/ui/web';
import { PRESENCE_PLATFORM_LABELS, PRESENCE_VERIFICATION_LABELS } from '@radial-pulse/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { CardSkeleton, ExternalLink, mutationErrorMessage, QueryError } from '../../app/page-kit';

type Profile = Schema<'PresenceProfileRead'>;
type Verification = Schema<'PresenceVerification'>;
type Filter = 'all' | Verification;

/**
 * Online presence found for the clinic. Discovery is automatic; a Digital
 * Success Manager confirms or rejects each profile. Human decisions are never
 * overwritten by discovery (enforced by the backend).
 */
export function DigitalInformationPage() {
  const clinicId = useClinicId();
  const profiles = usePresenceProfiles(clinicId);
  const canReview = useClinicCan(clinicId, 'presence:write');
  const [filter, setFilter] = useState<Filter>('all');

  if (profiles.isError) {
    return (
      <Card>
        <QueryError error={profiles.error} onRetry={() => void profiles.refetch()} />
      </Card>
    );
  }
  if (!profiles.data) return <CardSkeleton lines={5} />;

  const items = profiles.data.items;
  const count = (v: Verification) => items.filter((p) => p.verification === v).length;
  const visible = filter === 'all' ? items : items.filter((p) => p.verification === filter);

  return (
    <div className="rp-stack">
      <Tabs
        label="Filter profiles by verification"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: 'All', count: items.length },
          ...(['unverified', 'confirmed', 'rejected'] as const).map((v) => ({
            value: v,
            label: PRESENCE_VERIFICATION_LABELS[v],
            count: count(v),
          })),
        ]}
      />
      {visible.length === 0 ? (
        <Card>
          <EmptyState
            title={items.length === 0 ? 'No online profiles found yet' : 'No profiles in this view'}
            description={
              items.length === 0
                ? 'Profiles appear here once discovery has run for this clinic.'
                : 'Choose another filter to see the rest.'
            }
          />
        </Card>
      ) : (
        <div className="rp-presence">
          {visible.map((p) => (
            <ProfileCard key={p.id} clinicId={clinicId} profile={p} canReview={canReview} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileCard({
  clinicId,
  profile: p,
  canReview,
}: {
  clinicId: string;
  profile: Profile;
  canReview: boolean;
}) {
  const update = useUpdatePresenceProfile(clinicId);
  const decide = (verification: Verification) =>
    update.mutate({ profileId: p.id, body: { verification } });
  const evidence = p.evidence[0];

  return (
    <article className="rp-presence__card" aria-label={PRESENCE_PLATFORM_LABELS[p.platform]}>
      <div className="rp-presence__top">
        <div className="rp-stack-sm">
          <h3 className="rp-presence__platform">{PRESENCE_PLATFORM_LABELS[p.platform]}</h3>
          <span className="rp-presence__url">
            <ExternalLink href={p.url}>{p.display_name ?? displayHost(p.url)}</ExternalLink>
          </span>
        </div>
        <Badge tone={PRESENCE_VERIFICATION_TONES[p.verification]} dot>
          {PRESENCE_VERIFICATION_LABELS[p.verification]}
        </Badge>
      </div>
      <p className="rp-presence__meta">
        Found by {p.discovered_by}
        {p.confidence !== null && ` · ${Math.round(p.confidence * 100)}% match confidence`}
        {evidence?.observed_at && ` · seen ${formatDateTime(evidence.observed_at)}`}
      </p>
      {evidence?.excerpt && <p className="rp-muted rp-small">“{evidence.excerpt}”</p>}
      {canReview && p.verification === 'unverified' && (
        <div className="rp-presence__actions">
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={<Check size={14} />}
            loading={update.isPending && update.variables?.body.verification === 'confirmed'}
            disabled={update.isPending}
            onClick={() => decide('confirmed')}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leadingIcon={<X size={14} />}
            loading={update.isPending && update.variables?.body.verification === 'rejected'}
            disabled={update.isPending}
            onClick={() => decide('rejected')}
          >
            Not this clinic
          </Button>
        </div>
      )}
      {update.isError && (
        <p className="rp-form__error" role="alert">
          {mutationErrorMessage(update.error)}
        </p>
      )}
    </article>
  );
}
