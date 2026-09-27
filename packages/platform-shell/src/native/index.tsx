import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Native platform shell. PHASE 2 STUB: renders children only.
 * Phase 6: tabs host, ChatFab host, clinic switcher context. Phase 7:
 * SessionProvider (Amplify with a chunked expo-secure-store adapter).
 */
export function NativeAppShell({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
