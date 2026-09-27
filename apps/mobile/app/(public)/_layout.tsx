import { useSession } from '@radial-pulse/platform-shell/core';
import { Redirect, Stack } from 'expo-router';

/** Welcome and Sign in. A signed-in person never lands here. */
export default function PublicLayout() {
  const { state } = useSession();
  if (state.status === 'authenticated') return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
