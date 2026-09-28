import type { PlatformRole } from '@radial-pulse/shared-types';
import { PLATFORM_ROLE_LABELS } from '@radial-pulse/utils';

/**
 * Display name of the contract platform role (docs/glossary.md). Display
 * only: navigation and permissions use permissions, never role names.
 */
export function roleLabel(role: PlatformRole): string {
  return PLATFORM_ROLE_LABELS[role];
}
