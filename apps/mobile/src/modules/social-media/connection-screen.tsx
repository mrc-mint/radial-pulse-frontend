import { useConnection, useDisconnectConnection } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import { Screen } from '@radial-pulse/platform-shell/native';
import type { Schema } from '@radial-pulse/shared-types';
import {
  Badge,
  Button,
  Card,
  CONNECTION_STATUS_TONES,
  EmptyState,
  formatDate,
  formatRelativeTime,
  textStyle,
} from '@radial-pulse/ui/native';
import { CONNECTION_STATUS_LABELS } from '@radial-pulse/utils';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PLATFORM_ICONS } from '../../shell/icons';
import {
  Callout,
  CardSkeleton,
  confirmAction,
  DefinitionList,
  IconBubble,
  mutationErrorMessage,
  QueryErrorState,
} from '../../shell/kit';
import { SocialMetrics } from '../../shell/social-metrics';
import { useConnectPlatform } from '../../shell/use-connect-platform';

type Platform = Schema<'ConnectionPlatform'>;

const PLATFORMS = Object.keys(PLATFORM_ICONS) as Platform[];

/** One connected account (`/connection/[platform]`): status, sync and connect/disconnect. */
export function ConnectionScreen() {
  const params = useLocalSearchParams<{ platform: string }>();
  const platform = PLATFORMS.find((p) => p === params.platform) ?? null;
  if (!platform) {
    return (
      <Screen topInset={false} fabClearance={false}>
        <Card>
          <EmptyState title="Account not found" />
        </Card>
      </Screen>
    );
  }
  return <ConnectionDetail platform={platform} />;
}

function ConnectionDetail({ platform }: { platform: Platform }) {
  const clinicId = useClinicId();
  const canManage = useClinicCan(clinicId, 'connections:manage');
  const query = useConnection(clinicId, platform);
  const disconnect = useDisconnectConnection(clinicId);
  const { connect, connecting, error } = useConnectPlatform();
  const c = query.data;
  const Icon = PLATFORM_ICONS[platform];

  async function onDisconnect() {
    if (!c) return;
    const ok = await confirmAction(
      `Disconnect ${c.label}?`,
      'Radial Pulse will stop reading insights from this account. You can connect it again later.',
      'Disconnect',
    );
    if (ok) disconnect.mutate(platform, { onSuccess: () => void query.refetch() });
  }

  const linked = c?.status === 'connected' || c?.status === 'needs_reconnect';
  const tone = c ? CONNECTION_STATUS_TONES[c.status] : 'neutral';

  return (
    <Screen
      topInset={false}
      fabClearance={false}
      onRefresh={() => void query.refetch()}
      refreshing={query.isRefetching}
    >
      <Stack.Screen options={{ title: c?.label ?? '' }} />
      {query.isLoading ? (
        <CardSkeleton lines={4} />
      ) : query.error || !c ? (
        <Card>
          <QueryErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : (
        <>
          <View style={styles.hero}>
            <IconBubble tone={tone} size={64}>
              <Icon size={30} color={t.color.status[tone].fg} />
            </IconBubble>
            <Text style={styles.title} accessibilityRole="header">
              {c.label}
            </Text>
            <View style={styles.badge}>
              <Badge tone={tone} dot>
                {CONNECTION_STATUS_LABELS[c.status]}
              </Badge>
            </View>
          </View>

          {c.last_error ? <Callout tone="warning">{c.last_error}</Callout> : null}

          <Card padding="sm">
            <View style={styles.inset}>
              <DefinitionList
                items={[
                  ['Account', c.external_account_name],
                  ['Connected', c.connected_at ? formatDate(c.connected_at) : null],
                  ['Last synced', c.last_synced_at ? formatRelativeTime(c.last_synced_at) : null],
                ]}
              />
            </View>
          </Card>

          {c.platform !== 'google_business_profile' && c.platform !== 'x' && linked ? (
            <SocialMetrics platform={c.platform} />
          ) : null}

          <Text style={styles.note}>
            Radial Pulse only reads insights from this account. It never posts for you.
          </Text>

          {error ? <Callout tone="danger">{error.message}</Callout> : null}
          {disconnect.isError ? (
            <Callout tone="danger">{mutationErrorMessage(disconnect.error)}</Callout>
          ) : null}

          {canManage ? (
            <View style={styles.actions}>
              {c.status !== 'connected' && c.available ? (
                <Button
                  size="lg"
                  fullWidth
                  loading={connecting === platform}
                  onPress={() => void connect(platform)}
                >
                  {c.status === 'needs_reconnect' ? `Reconnect ${c.label}` : `Connect ${c.label}`}
                </Button>
              ) : null}
              {linked ? (
                <Button
                  variant="secondary"
                  fullWidth
                  loading={disconnect.isPending}
                  onPress={() => void onDisconnect()}
                >
                  Disconnect
                </Button>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: t.space[2], paddingVertical: t.space[2] },
  title: { ...textStyle('h1'), color: t.color.text.primary },
  badge: { alignItems: 'center' },
  inset: { paddingHorizontal: t.space[2] },
  note: { ...textStyle('bodySm'), color: t.color.text.tertiary, textAlign: 'center' },
  actions: { gap: t.space[3] },
});
