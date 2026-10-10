import { tokens } from '@radial-pulse/design-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * @radial-pulse/mobile-shell — the Clinic Administrator mobile
 * app's layout pieces: screen container, floating chat button, clinic
 * switcher, full-screen states and the brand. Routing (expo-router tabs,
 * the chat modal) stays in the app. Session, clinic selection and
 * permissions come from @radial-pulse/shell-core, shared with web.
 */
export function NativeAppShell({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: tokens.color.bg.app }}>{children}</View>;
}

export { BrandLockup, BrandMark } from './brand';
export { ChatFab } from './chat-fab';
export { ClinicSwitcher } from './clinic-switcher';
export { FullScreenLoading, FullScreenMessage } from './full-screen';
export { NAV_ICONS } from './icons';
export { FAB_CLEARANCE, Screen, SCREEN_GUTTER } from './screen';
