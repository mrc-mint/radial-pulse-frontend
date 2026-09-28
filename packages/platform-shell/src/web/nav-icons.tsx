import {
  Building2,
  FileText,
  House,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Settings,
  Share2,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { NavIcon } from '../core';

/** Web icon set for navigation (Lucide, ADR 0007). */
export const NAV_ICONS: Readonly<Record<NavIcon, LucideIcon>> = {
  dashboard: LayoutDashboard,
  clinics: Building2,
  users: Users,
  reports: FileText,
  settings: Settings,
  home: House,
  insights: Lightbulb,
  social: Share2,
  profile: UserRound,
  chat: MessageCircle,
};
