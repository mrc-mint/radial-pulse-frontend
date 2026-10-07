import { usePractitioners } from '@radial-pulse/api-client/react';
import { tokens as t } from '@radial-pulse/design-tokens';
import {
  useClinicCan,
  useClinicId,
  useCurrentSession,
  useSession,
} from '@radial-pulse/platform-shell/core';
import { Screen } from '@radial-pulse/platform-shell/native';
import { Avatar, Badge, Button, Card, PageHeader, Tabs, textStyle } from '@radial-pulse/ui/native';
import { CLINIC_ROLE_LABELS } from '@radial-pulse/utils';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Building2, Info, Link2, Mail, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelectedClinicRow } from '../../shell/clinic-data';
import { confirmAction, IconBubble, ListRow, SectionHeader } from '../../shell/kit';
import { MediaSection } from './media-section';

type ProfileTab = 'details' | 'media' | 'accounts';

/**
 * Profile: the clinic's main practitioner, then three tabs. Details: the
 * clinic, its Digital Success Manager, the app version and sign-out. Media:
 * practitioner photos, hospital photos and voice samples. Accounts: the signed-in
 * account and connected accounts. Clinic-side only: no team management,
 * platform settings or other clinics' data.
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
  const practitioners = usePractitioners(clinicId);
  const primary = practitioners.data?.items.find((p) => p.is_primary && p.is_active) ?? null;
  const [tab, setTab] = useState<ProfileTab>('details');

  async function onSignOut() {
    const ok = await confirmAction(
      'Sign out?',
      'You’ll need to sign in again to see your clinic.',
      'Sign out',
    );
    if (ok) await signOut();
  }

  const name = primary?.full_name ?? session.user.name;
  const credentials = [primary?.qualifications, primary?.specialty].filter(Boolean).join(' · ');

  return (
    <Screen header={<PageHeader title="Profile" />}>
      <View style={styles.person}>
        <Avatar name={name} size="lg" />
        <Text style={styles.name}>{name}</Text>
        {credentials ? <Text style={styles.detail}>{credentials}</Text> : null}
        {clinic ? (
          <Text style={styles.subtle}>
            {[clinic.name, clinic.city].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>

      <Tabs
        label="Profile sections"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'details', label: 'Details' },
          { value: 'media', label: 'Media' },
          { value: 'accounts', label: 'Accounts' },
        ]}
      />

      {tab === 'media' ? <MediaSection /> : null}

      {tab === 'details' ? (
        <>
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

          <SectionHeader title="App" />
          <Card padding="sm">
            <View style={styles.inset}>
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
        </>
      ) : null}

      {tab === 'accounts' ? (
        <>
          <SectionHeader title="Your account" />
          <Card padding="sm">
            <View style={styles.inset}>
              <ListRow
                last
                icon={
                  <IconBubble tone="neutral">
                    <Mail size={20} color={t.color.text.secondary} />
                  </IconBubble>
                }
                title={session.user.name}
                subtitle={session.user.email}
                trailing={
                  role ? (
                    <Badge tone="brand" size="sm">
                      {CLINIC_ROLE_LABELS[role]}
                    </Badge>
                  ) : undefined
                }
              />
            </View>
          </Card>
          {canSeeConnections ? (
            <>
              <SectionHeader title="Connected accounts" />
              <Card padding="sm">
                <View style={styles.inset}>
                  <ListRow
                    last
                    icon={
                      <IconBubble tone="neutral">
                        <Link2 size={20} color={t.color.text.secondary} />
                      </IconBubble>
                    }
                    title="Connected accounts"
                    subtitle="Manage your clinic’s linked accounts"
                    onPress={() => router.push('/connect-accounts')}
                  />
                </View>
              </Card>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  person: { alignItems: 'center', gap: t.space[1], paddingVertical: t.space[2] },
  name: { ...textStyle('h2'), color: t.color.text.primary, marginTop: t.space[2] },
  detail: { ...textStyle('body'), color: t.color.text.secondary, textAlign: 'center' },
  subtle: { ...textStyle('bodySm'), color: t.color.text.tertiary, textAlign: 'center' },
  inset: { paddingHorizontal: t.space[1] },
});
