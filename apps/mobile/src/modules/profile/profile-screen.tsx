import { tokens as t } from '@radial-pulse/design-tokens';
import {
  useClinicCan,
  useClinicId,
  useCurrentSession,
  useSession,
} from '@radial-pulse/platform-shell/core';
import { Screen } from '@radial-pulse/platform-shell/native';
import { Avatar, Badge, Button, Card, PageHeader, textStyle } from '@radial-pulse/ui/native';
import { CLINIC_ROLE_LABELS } from '@radial-pulse/utils';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Building2, Info, Link2, UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSelectedClinicRow } from '../../shell/clinic-data';
import { confirmAction, IconBubble, ListRow, SectionHeader } from '../../shell/kit';

/**
 * Profile: the person, their clinic and its Digital Success Manager, links
 * to clinic information and connected accounts, and sign-out. Clinic-side
 * only: no team management, platform settings or other clinics' data.
 */
export function ProfileScreen() {
  const router = useRouter();
  const session = useCurrentSession();
  const { signOut } = useSession();
  const clinicId = useClinicId();
  const clinic = useSelectedClinicRow();
  const canSeeConnections = useClinicCan(clinicId, 'connections:read');
  const role = session.clinicAccess.get(clinicId)?.clinicRole;
  const version = Constants.expoConfig?.version ?? null;

  async function onSignOut() {
    const ok = await confirmAction(
      'Sign out?',
      'You’ll need to sign in again to see your clinic.',
      'Sign out',
    );
    if (ok) await signOut();
  }

  return (
    <Screen header={<PageHeader title="Profile" description="Your account and clinic" />}>
      <Card>
        <View style={styles.person}>
          <Avatar name={session.user.name} src={session.user.avatarUrl ?? undefined} size="lg" />
          <View style={styles.personText}>
            <Text style={styles.name}>{session.user.name}</Text>
            <Text style={styles.email}>{session.user.email}</Text>
            {role ? (
              <Badge tone="brand" size="sm">
                {CLINIC_ROLE_LABELS[role]}
              </Badge>
            ) : null}
          </View>
        </View>
      </Card>

      {clinic ? (
        <>
          <SectionHeader title="Your clinic" />
          <Card padding="sm">
            <View style={styles.inset}>
              <ListRow
                icon={
                  <IconBubble>
                    <Building2 size={20} color={t.color.status.brand.fg} />
                  </IconBubble>
                }
                title={clinic.name}
                subtitle={[clinic.primary_practitioner_name, clinic.city]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => router.push('/clinic-information')}
                a11yLabel={`${clinic.name}. Clinic information`}
              />
              <ListRow
                last
                icon={
                  <IconBubble tone="neutral">
                    <UserRound size={20} color={t.color.text.secondary} />
                  </IconBubble>
                }
                title={clinic.dsm?.full_name ?? clinic.dsm?.email ?? 'Not assigned yet'}
                subtitle="Your Digital Success Manager"
              />
            </View>
          </Card>
        </>
      ) : null}

      <SectionHeader title="Settings" />
      <Card padding="sm">
        <View style={styles.inset}>
          {canSeeConnections ? (
            <ListRow
              icon={
                <IconBubble tone="neutral">
                  <Link2 size={20} color={t.color.text.secondary} />
                </IconBubble>
              }
              title="Connected accounts"
              subtitle="Manage your clinic’s linked accounts"
              onPress={() => router.push('/connect-accounts')}
            />
          ) : null}
          <ListRow
            last
            icon={
              <IconBubble tone="neutral">
                <Info size={20} color={t.color.text.secondary} />
              </IconBubble>
            }
            title="About"
            subtitle={version ? `Radial Pulse ${version}` : 'Radial Pulse'}
          />
        </View>
      </Card>

      <Button variant="secondary" fullWidth onPress={() => void onSignOut()}>
        Sign out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  person: { flexDirection: 'row', alignItems: 'center', gap: t.space[4] },
  personText: { flex: 1, gap: t.space[1] },
  name: { ...textStyle('h2'), color: t.color.text.primary },
  email: { ...textStyle('body'), color: t.color.text.secondary },
  inset: { paddingHorizontal: t.space[1] },
});
