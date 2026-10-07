import { tokens as t } from '@radial-pulse/design-tokens';
import { useConfig, useSession } from '@radial-pulse/platform-shell/core';
import { BrandLockup } from '@radial-pulse/platform-shell/native';
import { Badge, Button, textStyle } from '@radial-pulse/ui/native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Callout } from '../../shell/kit';

const CLINIC_ADMINISTRATOR_OPTION = 'clinic-administrator';

/**
 * Branded sign-in. Authentication itself happens on Cognito Managed Login
 * (email and password, Authorization Code + PKCE) in the system browser;
 * there is no password form in the app. With API mocking, development
 * personas sign in instead.
 */
export function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const config = useConfig();
  const { state, signIn, signInOptions, signInMethod } = useSession();
  const [showOthers, setShowOthers] = useState(false);
  const busy = state.status === 'loading';

  const primary = signInOptions.find((o) => o.id === CLINIC_ADMINISTRATOR_OPTION);
  const others = signInOptions.filter((o) => o !== primary);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + t.space[2], paddingBottom: insets.bottom + t.space[6] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
        hitSlop={8}
        style={styles.back}
      >
        <ChevronLeft size={24} color={t.color.text.primary} />
      </Pressable>

      <View style={styles.brand}>
        <BrandLockup size={64} />
      </View>

      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">
          Welcome back
        </Text>
        <Text style={styles.subtitle}>Sign in to your clinic account</Text>
      </View>

      {state.status === 'error' ? (
        <Callout tone="danger">Sign-in didn’t complete. Please try again.</Callout>
      ) : null}

      {signInMethod === 'cognito' ? (
        <View style={styles.options}>
          <Button size="lg" fullWidth loading={busy} onPress={() => void signIn()}>
            Sign in
          </Button>
          <Text style={styles.note}>
            You’ll continue on Radial Pulse’s secure sign-in page, then come back here.
          </Text>
        </View>
      ) : signInOptions.length === 0 ? (
        <>
          <Button size="lg" fullWidth disabled>
            Sign in
          </Button>
          <Callout tone="warning">
            Sign-in isn’t available in this build yet. It will open Radial Pulse’s secure sign-in
            page once it is set up.
          </Callout>
        </>
      ) : (
        <View style={styles.options}>
          {config.appEnv !== 'prod' ? (
            <Badge tone="warning" dot>
              Development sign-in — no password required
            </Badge>
          ) : null}
          {primary ? (
            <Button
              size="lg"
              fullWidth
              loading={busy}
              onPress={() => void signIn(primary.id)}
              accessibilityHint={primary.description}
            >
              Sign in as {primary.label}
            </Button>
          ) : null}
          {others.length > 0 ? (
            <>
              <Button variant="ghost" fullWidth onPress={() => setShowOthers((v) => !v)}>
                {showOthers ? 'Hide other development accounts' : 'Other development accounts'}
              </Button>
              {showOthers
                ? others.map((option) => (
                    <Button
                      key={option.id}
                      variant="secondary"
                      fullWidth
                      disabled={busy}
                      onPress={() => void signIn(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))
                : null}
            </>
          ) : null}
        </View>
      )}

      <Text style={styles.note}>
        Your Digital Success Manager sets up your account. Use the email address from your
        invitation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.color.bg.surface },
  content: { gap: t.space[5], paddingHorizontal: t.space[6] },
  back: {
    width: t.size.touchTarget,
    height: t.size.touchTarget,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center', marginTop: t.space[4] },
  heading: { alignItems: 'center', gap: t.space[1] },
  title: { ...textStyle('h1'), color: t.color.text.primary },
  subtitle: { ...textStyle('bodyLg'), color: t.color.text.secondary },
  options: { gap: t.space[3] },
  note: { ...textStyle('bodySm'), color: t.color.text.tertiary, textAlign: 'center' },
});
