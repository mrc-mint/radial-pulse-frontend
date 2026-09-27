import { NativeAppShell } from '@radial-pulse/platform-shell/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Phase 2 placeholder. The (public)/(setup)/(app) groups and tabs
// (architecture §7) arrive in Phase 6; session guards in Phase 7.
export default function RootLayout() {
  return (
    <NativeAppShell>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </NativeAppShell>
  );
}
