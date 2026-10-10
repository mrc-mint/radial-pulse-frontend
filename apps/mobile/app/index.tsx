import { useSession } from '@radial-pulse/shell-core';
import { FullScreenLoading } from '@radial-pulse/mobile-shell';
import { Redirect } from 'expo-router';

/** Launch: signed-in people go to Home, everyone else to Welcome. */
export default function Index() {
  const { state } = useSession();
  if (state.status === 'loading') return <FullScreenLoading />;
  return <Redirect href={state.status === 'authenticated' ? '/home' : '/welcome'} />;
}
