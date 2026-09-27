import { useConnections } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId, useCurrentSession } from '@radial-pulse/platform-shell/core';
import { ClinicSwitcher, Screen } from '@radial-pulse/platform-shell/native';
import { Card, EmptyState, sortByPriority, textStyle } from '@radial-pulse/ui/native';
import { useRouter } from 'expo-router';
import { FileSearch, Link2 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  allFindings,
  ComponentGrid,
  FindingRow,
  ScoreHero,
  type ComponentKey,
} from '../../shell/assessment-kit';
import { useAccessibleClinics, useAssessmentDetail } from '../../shell/clinic-data';
import { deviceStorage } from '../../shell/device-storage';
import {
  CardSkeleton,
  IconBubble,
  ListRow,
  QueryErrorState,
  SectionHeader,
  TextLink,
} from '../../shell/kit';

const KEY_FINDINGS = 3;

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Home: the selected clinic at a glance, from its latest published
 * assessment. No ratings, trends or activity feed: the contract has none.
 */
export function HomeScreen() {
  const router = useRouter();
  const session = useCurrentSession();
  const clinicId = useClinicId();
  const clinics = useAccessibleClinics();
  const { list, detail, none, isLoading, error, refetch } = useAssessmentDetail(null);
  const connections = useConnections(clinicId);
  const canConnect = useClinicCan(clinicId, 'connections:manage');
  useConnectPrompt(session.user.id, canConnect, connections.data);

  const openComponent = (key: ComponentKey) =>
    router.push({ pathname: '/insights', params: { component: key } });

  const assessment = detail.data;
  const findings = assessment ? sortByPriority(allFindings(assessment.components)) : [];
  const offered = (connections.data ?? []).filter((c) => c.available || c.status === 'connected');
  const connected = offered.filter((c) => c.status === 'connected').length;

  return (
    <Screen
      onRefresh={() => void Promise.all([refetch(), connections.refetch(), clinics.refetch()])}
      refreshing={list.isRefetching || detail.isRefetching}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.name} accessibilityRole="header">
          {session.user.name}
        </Text>
        <ClinicSwitcher
          subtitle={(id) => clinics.data?.items.find((c) => c.id === id)?.city ?? null}
        />
      </View>

      {isLoading ? (
        <CardSkeleton lines={4} />
      ) : error ? (
        <Card>
          <QueryErrorState error={error} onRetry={() => void refetch()} />
        </Card>
      ) : none || !assessment ? (
        <Card>
          <EmptyState
            icon={<FileSearch size={22} color={t.color.text.tertiary} />}
            title="Your first assessment is on its way"
            description="Your Digital Success Manager will publish your clinic’s Digital Presence Assessment here when it’s ready."
          />
        </Card>
      ) : (
        <>
          <Card
            title="Overall Digital Presence Score"
            onPress={() => router.push('/insights')}
            accessibilityLabel="Overall Digital Presence Score. Open insights"
          >
            <ScoreHero assessment={assessment} />
          </Card>

          <SectionHeader title="Your digital presence" />
          <ComponentGrid components={assessment.components} onSelect={openComponent} />

          <SectionHeader
            title="Key findings"
            action={
              findings.length > KEY_FINDINGS ? (
                <TextLink label="View all" onPress={() => router.push('/insights')} />
              ) : undefined
            }
          />
          <Card padding="sm">
            {findings.length === 0 ? (
              <Text style={styles.muted}>This assessment has no findings.</Text>
            ) : (
              <View style={styles.inset}>
                {findings.slice(0, KEY_FINDINGS).map((f, i, shown) => (
                  <FindingRow
                    key={f.id}
                    finding={f}
                    componentKey={f.componentKey}
                    onPress={() => openComponent(f.componentKey)}
                    last={i === shown.length - 1}
                  />
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      {connections.data && offered.length > 0 ? (
        <Card padding="sm">
          <View style={styles.inset}>
            <ListRow
              last
              icon={
                <IconBubble tone={connected > 0 ? 'success' : 'neutral'}>
                  <Link2
                    size={20}
                    color={connected > 0 ? t.color.status.success.fg : t.color.text.tertiary}
                  />
                </IconBubble>
              }
              title="Connected accounts"
              subtitle={`${connected} of ${offered.length} connected`}
              onPress={() => router.push('/social-media')}
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

/**
 * After sign-in, offer "Connect Your Accounts" once while nothing is
 * connected. Skipping is remembered on this device.
 */
function useConnectPrompt(
  userId: string,
  canConnect: boolean,
  connections: ReadonlyArray<{ status: string; available: boolean }> | undefined,
) {
  const router = useRouter();
  const checked = useRef(false);
  const noneConnected =
    connections !== undefined &&
    connections.some((c) => c.available) &&
    !connections.some((c) => c.status === 'connected');

  useEffect(() => {
    if (!canConnect || !noneConnected || checked.current) return;
    checked.current = true;
    void deviceStorage.getConnectDismissed(userId).then((dismissed) => {
      if (!dismissed) router.push({ pathname: '/connect-accounts', params: { setup: '1' } });
    });
  }, [canConnect, noneConnected, userId, router]);
}

const styles = StyleSheet.create({
  header: { gap: 2, paddingTop: t.space[2] },
  greeting: { ...textStyle('bodyLg'), color: t.color.text.secondary },
  name: { ...textStyle('h1'), color: t.color.bg.inverse },
  inset: { paddingHorizontal: t.space[1] },
  muted: { ...textStyle('body'), color: t.color.text.tertiary, padding: t.space[2] },
});
