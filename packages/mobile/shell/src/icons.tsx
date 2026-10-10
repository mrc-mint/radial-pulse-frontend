import {
  ChartColumn,
  FileText,
  House,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Share2,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import type { NavIcon } from '@radial-pulse/shell-core';

/** Lucide icon for each platform-neutral nav icon name (native). */
export const NAV_ICONS: Readonly<Record<NavIcon, LucideIcon>> = {
  dashboard: LayoutDashboard,
  clinics: Store,
  users: Users,
  reports: FileText,
  settings: Settings,
  home: House,
  insights: ChartColumn,
  social: Share2,
  profile: UserRound,
  chat: MessageCircle,
};
