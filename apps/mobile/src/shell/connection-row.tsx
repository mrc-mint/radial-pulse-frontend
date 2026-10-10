import { tokens as t } from '@radial-pulse/design-tokens';
import type { Schema } from '@radial-pulse/shared-types';
import { Badge, CONNECTION_STATUS_TONES, formatRelativeTime } from '@radial-pulse/mobile-ui';
import { CONNECTION_STATUS_LABELS } from '@radial-pulse/utils';
import type { ReactNode } from 'react';
import { PLATFORM_ICONS } from './icons';
import { IconBubble, ListRow } from './kit';

type Connection = Schema<'ConnectionRead'>;

/**
 * Platforms worth showing a Clinic Administrator: ones the server can
 * connect (`available`) plus any already linked. The API decides both.
 */
export function offeredConnections(connections: ReadonlyArray<Connection> | undefined) {
  return (connections ?? []).filter(
    (c) => c.available || (c.status !== 'not_connected' && c.status !== 'disconnected'),
  );
}

/** Account and sync line for a linked platform; the status badge covers the rest. */
export function connectionSubtitle(c: Connection): string | null {
  if (c.status === 'connected' || c.status === 'needs_reconnect') {
    const synced = c.last_synced_at ? `Synced ${formatRelativeTime(c.last_synced_at)}` : null;
    return [c.external_account_name, synced].filter(Boolean).join(' · ') || null;
  }
  return c.available ? null : 'Not available yet';
}

/** A platform row: neutral icon, label, account/sync line, status or an action. */
export function ConnectionRow({
  connection,
  trailing,
  onPress,
  last,
}: {
  connection: Connection;
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const Icon = PLATFORM_ICONS[connection.platform];
  const tone = CONNECTION_STATUS_TONES[connection.status];
  return (
    <ListRow
      last={last}
      onPress={onPress}
      icon={
        <IconBubble tone={tone === 'neutral' ? 'neutral' : tone}>
          <Icon size={20} color={t.color.status[tone].fg} />
        </IconBubble>
      }
      title={connection.label}
      subtitle={connectionSubtitle(connection)}
      a11yLabel={`${connection.label}, ${CONNECTION_STATUS_LABELS[connection.status]}`}
      trailing={
        trailing ?? (
          <Badge tone={tone} size="sm">
            {CONNECTION_STATUS_LABELS[connection.status]}
          </Badge>
        )
      }
    />
  );
}
