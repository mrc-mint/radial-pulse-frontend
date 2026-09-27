// Per-weight entry points: only the four faces the design tokens use are bundled.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ConfigErrorScreen } from '../src/shell/config-error';
import { AppProviders } from '../src/shell/providers';
import { createMobileServices, type MobileServices } from '../src/shell/services';

type Boot = { services: MobileServices } | { error: unknown };

function boot(): Boot {
  try {
    return { services: createMobileServices() };
  } catch (error) {
    return { error };
  }
}

/**
 * Root: build config, session and API client once, load Inter, then hand
 * over to the route groups — (public) Welcome/Sign in, (app) the signed-in
 * Clinic Administrator app.
 */
export default function RootLayout() {
  const [booted] = useState(boot);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if ('error' in booted) return <ConfigErrorScreen error={booted.error} />;
  // Until Inter loads (or fails, falling back to the system font) render nothing.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders services={booted.services}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
