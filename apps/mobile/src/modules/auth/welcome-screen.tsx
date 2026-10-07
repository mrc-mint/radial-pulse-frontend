import { tokens as t } from '@radial-pulse/design-tokens';
import { BrandLockup } from '@radial-pulse/platform-shell/native';
import { Button, fontStyle, textStyle } from '@radial-pulse/ui/native';
import { useRouter } from 'expo-router';
import { ChartColumn, FileText, MessageCircle, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconBubble } from '../../shell/kit';

const FEATURES: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: ChartColumn,
    title: 'Insights',
    body: 'See how your clinic appears online and what to improve first.',
  },
  {
    icon: FileText,
    title: 'Assessments',
    body: 'Every assessment your Digital Success Manager publishes, in one place.',
  },
  {
    icon: MessageCircle,
    title: 'Client Collaboration',
    body: 'Chat with your Digital Success Manager and share files.',
  },
];

/** First screen for a signed-out person. Product copy only: no scores or metrics. */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + t.space[10], paddingBottom: insets.bottom + t.space[6] },
      ]}
    >
      <BrandLockup />
      <View style={styles.hero}>
        <Text style={styles.headline} accessibilityRole="header">
          Your clinic’s digital presence, in one place.
        </Text>
        <Text style={styles.lead}>
          Radial Pulse helps clinics be found online, with a Digital Success Manager by your side.
        </Text>
      </View>
      <View style={styles.features}>
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <View key={title} style={styles.feature}>
            <IconBubble>
              <Icon size={20} color={t.color.status.brand.fg} />
            </IconBubble>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureBody}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.spacer} />
      <Button size="lg" fullWidth onPress={() => router.push('/sign-in')}>
        Get started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: t.space[6],
    backgroundColor: t.color.bg.surface,
  },
  hero: { gap: t.space[3], marginTop: t.space[10] },
  headline: {
    ...fontStyle(700),
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: t.color.bg.inverse,
  },
  lead: { ...textStyle('bodyLg'), color: t.color.text.secondary },
  features: { gap: t.space[4], marginTop: t.space[8] },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space[3] },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { ...textStyle('h3'), color: t.color.text.primary },
  featureBody: { ...textStyle('body'), color: t.color.text.secondary },
  spacer: { flex: 1, minHeight: t.space[6] },
});
