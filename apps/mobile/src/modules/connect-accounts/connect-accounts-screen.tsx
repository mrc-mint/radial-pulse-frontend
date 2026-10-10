import { useConnections } from '@radial-pulse/api-client-react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId, useCurrentSession } from '@radial-pulse/shell-core';
import { Screen } from '@radial-pulse/mobile-shell';
import { Badge, Button, Card, EmptyState, PageHeader } from '@radial-pulse/mobile-ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Link2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ConnectionRow, offeredConnections } from '../../shell/connection-row';
import { deviceStorage } from '../../shell/device-storage';
import { Callout, CardSkeleton, QueryErrorState } from '../../shell/kit';
import { useConnectPlatform } from '../../shell/use-connect-platform';

/**
 * "Connect Your Accounts": link the clinic's platforms (read-only insights).
 * Shown once after first sign-in (`?setup=1`, skippable) and from Profile or
 * Social Media. Only platforms the API offers are listed.
 */
export function ConnectAccountsScreen() {
  const router = useRouter();
  const { setup } = useLocalSearchParams<{ setup?: string }>();
  const isSetup = setup === '1';
  const clinicId = useClinicId();
  const { user } = useCurrentSession();
  const connections = useConnections(clinicId);
  const canManage = useClinicCan(clinicId, 'connections:manage');
  const { connect, connecting, error } = useConnectPlatform();
  const offered = offeredConnections(connections.data);

  // Seen once: the setup step is not offered again on this device.
  useEffect(() => {
    if (isSetup) deviceStorage.setConnectDismissed(user.id);
  }, [isSetup, user.id]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <Screen
      topInset={false}
      fabClearance={false}
      onRefresh={() => void connections.refetch()}
      refreshing={connections.isRefetching}
    >
      <PageHeader
        title="Connect your accounts"
        description="Link your clinic’s accounts so your Digital Success Manager can see how your clinic is doing online. Radial Pulse only reads insights; it never posts for you."
      />

      {connections.isLoading ? (
        <CardSkeleton lines={4} />
      ) : connections.error ? (
        <Card>
          <QueryErrorState error={connections.error} onRetry={() => void connections.refetch()} />
        </Card>
      ) : offered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Link2 size={22} color={t.color.text.tertiary} />}
            title="No accounts can be connected yet"
            description="Your Digital Success Manager will let you know when account connections are available."
          />
        </Card>
      ) : (
        <Card padding="sm">
          <View style={styles.inset}>
            {offered.map((c, i) => {
              const connected = c.status === 'connected';
              const busy = connecting === c.platform;
              const action = connected ? (
                <Badge tone="success" size="sm" dot>
                  Connected
                </Badge>
              ) : canManage && c.available ? (
                <Button
                  size="sm"
                  variant={c.status === 'needs_reconnect' ? 'primary' : 'secondary'}
                  loading={busy}
                  disabled={connecting !== null && !busy}
                  onPress={() => void connect(c.platform)}
                  accessibilityLabel={`${c.status === 'needs_reconnect' ? 'Reconnect' : 'Connect'} ${c.label}`}
                >
                  {c.status === 'needs_reconnect' ? 'Reconnect' : 'Connect'}
                </Button>
              ) : undefined;
              return (
                <ConnectionRow
                  key={c.platform}
                  connection={c}
                  trailing={action}
                  last={i === offered.length - 1}
                />
              );
            })}
          </View>
        </Card>
      )}

      {error ? <Callout tone="danger">{error.message}</Callout> : null}
      {!canManage ? (
        <Callout>Connecting accounts isn’t available for your account at this clinic.</Callout>
      ) : null}

      {isSetup ? (
        <View style={styles.footer}>
          <Button size="lg" fullWidth onPress={done}>
            Continue
          </Button>
          <Button variant="ghost" fullWidth onPress={done}>
            Skip for now
          </Button>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  inset: { paddingHorizontal: t.space[1] },
  footer: { gap: t.space[2], marginTop: t.space[2] },
});
