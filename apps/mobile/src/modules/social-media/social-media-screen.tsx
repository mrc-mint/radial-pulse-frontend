import { useConnections } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import { Screen } from '@radial-pulse/platform-shell/native';
import {
  Button,
  Card,
  COMPONENT_STATUS_TONES,
  EmptyState,
  PageHeader,
  ScoreCard,
} from '@radial-pulse/ui/native';
import { formatComponentScore } from '@radial-pulse/utils';
import { useRouter } from 'expo-router';
import { ChartColumn, Link2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { componentCaption } from '../../shell/assessment-kit';
import { useAssessmentDetail } from '../../shell/clinic-data';
import { ConnectionRow, offeredConnections } from '../../shell/connection-row';
import { CardSkeleton, QueryErrorState, SectionHeader, TextLink } from '../../shell/kit';

/**
 * Social Media (V1): connected accounts and the assessment's Social Presence
 * section. Follower/engagement metrics and posts are not in V1 (the metric
 * catalogue is not published), so they are shown as not yet available.
 */
export function SocialMediaScreen() {
  const router = useRouter();
  const clinicId = useClinicId();
  const canManage = useClinicCan(clinicId, 'connections:manage');
  const connections = useConnections(clinicId);
  const { detail, refetch } = useAssessmentDetail(null);
  const offered = offeredConnections(connections.data);
  const social = detail.data?.components.find((c) => c.key === 'social_presence');

  return (
    <Screen
      onRefresh={() => void Promise.all([connections.refetch(), refetch()])}
      refreshing={connections.isRefetching}
      header={
        <PageHeader
          title="Social Media"
          description="Your connected accounts and social presence"
        />
      }
    >
      {social && detail.data ? (
        <ScoreCard
          label="Social Presence"
          score={social.status === 'completed' ? social.score : null}
          emptyLabel={formatComponentScore(social)}
          tone={COMPONENT_STATUS_TONES[social.status]}
          caption={componentCaption(social)}
        />
      ) : null}

      <SectionHeader
        title="Connected accounts"
        action={
          canManage && offered.length > 0 ? (
            <TextLink
              label="Manage"
              onPress={() => router.push('/connect-accounts')}
              a11yLabel="Manage connected accounts"
            />
          ) : undefined
        }
      />
      {connections.isLoading ? (
        <CardSkeleton lines={3} />
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
            {offered.map((c, i) => (
              <ConnectionRow
                key={c.platform}
                connection={c}
                last={i === offered.length - 1}
                onPress={() =>
                  router.push({
                    pathname: '/connection/[platform]',
                    params: { platform: c.platform },
                  })
                }
              />
            ))}
          </View>
          {canManage && !offered.some((c) => c.status === 'connected') ? (
            <View style={styles.cta}>
              <Button fullWidth onPress={() => router.push('/connect-accounts')}>
                Connect accounts
              </Button>
            </View>
          ) : null}
        </Card>
      )}

      <SectionHeader title="Audience and engagement" />
      <Card>
        <EmptyState
          icon={<ChartColumn size={22} color={t.color.text.tertiary} />}
          title="Not available yet"
          description="Follower and engagement numbers from your connected accounts aren’t available in this version of Radial Pulse."
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inset: { paddingHorizontal: t.space[1] },
  cta: { padding: t.space[2] },
});
