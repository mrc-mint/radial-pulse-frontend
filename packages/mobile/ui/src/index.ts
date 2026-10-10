/**
 * @radial-pulse/mobile-ui — React Native implementations of the shared
 * contracts, designed for touch (44pt targets, bottom sheets, segmented tabs).
 * Presentational only: components receive data and never fetch.
 *
 * Web-only primitives (Table, Pagination, DropdownMenu, Drawer, SearchInput)
 * have no native counterpart because no V1 mobile screen needs them.
 */
export type * from '@radial-pulse/ui-shared';
export {
  avatarToneFor,
  displayHost,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatMetricValue,
  getInitials,
} from '@radial-pulse/ui-shared';
export {
  CLINIC_STATUS_TONES,
  CLINIC_STAGE_TONES,
  ASSESSMENT_STATUS_TONES,
  COMPONENT_STATUS_TONES,
  APPROVAL_STATE_TONES,
  PUBLICATION_STATE_TONES,
  PRESENCE_VERIFICATION_TONES,
  CONNECTION_STATUS_TONES,
  WORK_ITEM_STATUS_TONES,
  WORK_ITEM_PRIORITY_TONES,
  USER_STATUS_TONES,
  FINDING_PRIORITY_TONES,
} from '@radial-pulse/ui-shared';
export { findingCardProps, sortByPriority } from '@radial-pulse/ui-shared';

/** Typography helpers for app-level native styles (Inter faces + token text styles). */
export { font as fontStyle, text as textStyle } from './theme';

export { Button, IconButton } from './button';
export type { ButtonProps, IconButtonProps } from './button';
export { Input, Select } from './field';
export type { InputProps, SelectProps } from './field';
export { Avatar, Badge, Card, PageHeader, Tabs } from './display';
export type { AvatarProps, BadgeProps, CardProps, PageHeaderProps, TabsProps } from './display';
export { Modal } from './overlay';
export type { ModalProps } from './overlay';
export { MetricCard, ScoreCard } from './metrics';
export { ScoreRing } from './score-ring';
export type { ScoreRingProps } from './score-ring';
export type { MetricCardProps, ScoreCardProps } from './metrics';
export { FindingCard } from './finding';
export type { FindingCardProps } from './finding';
export { ProtectedImage } from './media';
export type { ProtectedImageProps } from './media';
export { EmptyState, ErrorState, LoadingState, Skeleton } from './feedback';
export type {
  EmptyStateProps,
  ErrorStateProps,
  LoadingStateProps,
  SkeletonProps,
} from './feedback';
