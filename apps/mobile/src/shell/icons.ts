import type { Schema } from '@radial-pulse/shared-types';
import {
  AtSign,
  Briefcase,
  Camera,
  Globe,
  MapPin,
  Play,
  Search,
  Share2,
  Store,
  ThumbsUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Icons for contract enum values (exhaustive, so a new contract value is a
 * compile error). Lucide has no brand logos; connected platforms use neutral
 * icons beside their names until official brand marks are supplied.
 */
export const COMPONENT_ICONS: Readonly<Record<Schema<'AssessmentComponentKey'>, LucideIcon>> = {
  website: Globe,
  google_business_profile: Store,
  local_search: MapPin,
  search_readiness: Search,
  social_presence: Share2,
  competitor_benchmark: Trophy,
};

export const PLATFORM_ICONS: Readonly<Record<Schema<'ConnectionPlatform'>, LucideIcon>> = {
  google_business_profile: Store,
  instagram: Camera,
  facebook: ThumbsUp,
  youtube: Play,
  linkedin: Briefcase,
  x: AtSign,
};
