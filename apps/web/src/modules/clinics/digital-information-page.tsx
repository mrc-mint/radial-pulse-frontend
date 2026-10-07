import {
  useConnections,
  usePresenceProfiles,
  useUpdatePresenceProfile,
} from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Badge,
  Button,
  Card,
  displayHost,
  EmptyState,
  formatDateTime,
  formatRelativeTime,
  PRESENCE_VERIFICATION_TONES,
  Tabs,
} from '@radial-pulse/ui/web';
import { PRESENCE_PLATFORM_LABELS, PRESENCE_VERIFICATION_LABELS } from '@radial-pulse/utils';
import { Check, Link2, X } from 'lucide-react';
import { useState } from 'react';
import { CardSkeleton, ExternalLink, mutationErrorMessage, QueryError } from '../../app/page-kit';

type Profile = Schema<'PresenceProfileRead'>;
type Platform = Schema<'PresencePlatform'>;
type Connection = Schema<'ConnectionRead'>;
type Verification = Schema<'PresenceVerification'>;
type Filter = 'all' | Verification;
type Scope = 'digital' | 'listings';

/**
 * Which tab shows each contract platform: the clinic's own presence
 * (website, Google, social) or directory listings. Exhaustive: a new
 * platform in the contract is a compile error here.
 */
const SCOPE_OF_PLATFORM: Readonly<Record<Platform, Scope>> = {
  website: 'digital',
  google_business_profile: 'digital',
  instagram: 'digital',
  facebook: 'digital',
  youtube: 'digital',
  linkedin: 'digital',
  x: 'digital',
  practo: 'listings',
  justdial: 'listings',
  other: 'listings',
};

const COPY: Record<Scope, { empty: string; emptyHint: string }> = {
  digital: {
    empty: 'No online profiles found yet',
    emptyHint: 'Website, Google and social profiles appear here once discovery has run.',
  },
  listings: {
    empty: 'No directory listings found yet',
    emptyHint: 'Listings on Practo, Justdial and other directories appear here once found.',
  },
};

/**
 * Online presence found for the clinic, split into Digital Presence and
 * Listings. Discovery is automatic; a Digital Success Manager confirms or
 * rejects each profile, and the backend never lets discovery overwrite that
 * decision. When the clinic has connected the same platform, the profile
 * shows it, and a rejected profile can be confirmed again.
 */
export function PresencePage({ scope }: { scope: Scope }) {
  const clinicId = useClinicId();
  const profiles = usePresenceProfiles(clinicId);
  const canReview = useClinicCan(clinicId, 'presence:write');
  const canSeeConnections = useClinicCan(clinicId, 'connections:read');
  const connections = useConnections(clinicId, {
    enabled: canSeeConnections && scope === 'digital',
  });
  const [filter, setFilter] = useState<Filter>('all');

  if (profiles.isError) {
    return (
      <Card>
        <QueryError error={profiles.error} onRetry={() => void profiles.refetch()} />
      </Card>
    );
  }
  if (!profiles.data) return <CardSkeleton lines={5} />;

  const items = profiles.data.items.filter((p) => SCOPE_OF_PLATFORM[p.platform] === scope);
  const count = (v: Verification) => items.filter((p) => p.verification === v).length;
  const visible = filter === 'all' ? items : items.filter((p) => p.verification === filter);
  const connectionOf = (platform: Platform) =>
    connections.data?.find(
      (c) =>
        c.platform === platform && (c.status === 'connected' || c.status === 'needs_reconnect'),
    );

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
            title={items.length === 0 ? COPY[scope].empty : 'No profiles in this view'}
            description={
              items.length === 0 ? COPY[scope].emptyHint : 'Choose another filter to see the rest.'
            }
          />
        </Card>
      ) : (
        <div className="rp-presence">
          {visible.map((p) => (
            <ProfileCard
              key={p.id}
              clinicId={clinicId}
              profile={p}
              canReview={canReview}
              connection={connectionOf(p.platform)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DigitalInformationPage() {
  return <PresencePage scope="digital" />;
}

export function ListingsPage() {
  return <PresencePage scope="listings" />;
}

function ProfileCard({
  clinicId,
  profile: p,
  canReview,
  connection,
}: {
  clinicId: string;
  profile: Profile;
  canReview: boolean;
  connection: Connection | undefined;
}) {
  const update = useUpdatePresenceProfile(clinicId);
  const decide = (verification: Verification) =>
    update.mutate({ profileId: p.id, body: { verification } });
  const evidence = p.evidence[0];
  const reviewAgain = p.verification === 'rejected' && connection !== undefined;

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
      {connection && (
        <p className="rp-presence__connected">
          <Link2 size={14} aria-hidden="true" />
          <span>
            Connected by the client
            {connection.external_account_name ? ` · ${connection.external_account_name}` : ''}
            {connection.last_synced_at
              ? ` · synced ${formatRelativeTime(connection.last_synced_at)}`
              : ''}
          </span>
        </p>
      )}
      {reviewAgain && (
        <p className="rp-callout" role="note">
          The client has connected this platform. Check whether this is the same account and confirm
          it if so.
        </p>
      )}
      {canReview && (p.verification === 'unverified' || reviewAgain) && (
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
          {p.verification === 'unverified' && (
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<X size={14} />}
              loading={update.isPending && update.variables?.body.verification === 'rejected'}
              disabled={update.isPending}
              onClick={() => decide('rejected')}
            >
              Not this client
            </Button>
          )}
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
