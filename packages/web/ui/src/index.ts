/**
 * @radial-pulse/web-ui — DOM implementations. Presentational only: components
 * receive data and never fetch.
 *
 * Styling: interactive components (Button, Select, Modal/Drawer, Tabs,
 * DropdownMenu, Input) are shadcn-style — React Aria Components for
 * behaviour, Tailwind classes (tailwind.css, mapped onto the token variables)
 * for styling. The rest is plain CSS over the token variables. The app must
 * load `@radial-pulse/design-tokens/css` once at the root and run Tailwind's
 * Vite plugin. Styles are imported by the modules and by this entry, which
 * `sideEffects` in package.json marks as side-effectful so bundling keeps them.
 */
import './base.css';
import './tailwind.css';

export type * from '@radial-pulse/ui-shared';
export {
  avatarToneFor,
  displayHost,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatMetricValue,
  getInitials,
  getPageItems,
  getPageRange,
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

export { Button, IconButton, Spinner, buttonClassName } from './button';
export type { ButtonClassOptions, ButtonProps, IconButtonProps } from './button';
export { Input, SearchInput, Select } from './field';
export type { InputProps, SearchInputProps, SelectProps } from './field';
export { Avatar, Badge, Card, PageHeader } from './display';
export type { AvatarProps, BadgeProps, CardProps, PageHeaderProps } from './display';
export { Tabs } from './tabs';
export type { TabsProps } from './tabs';
export { Pagination, Table } from './table';
export type { PaginationProps, TableColumn, TableProps } from './table';
export { Drawer, Modal } from './overlay';
export type { DrawerProps, ModalProps } from './overlay';
export { DropdownMenu } from './dropdown';
export type { DropdownItem, DropdownMenuProps } from './dropdown';
export { MetricCard, ScoreCard } from './metrics';
export type { MetricCardProps, ScoreCardProps } from './metrics';
export { FindingCard } from './finding';
export type { FindingCardProps } from './finding';
export { ProtectedAudio, ProtectedImage } from './media';
export type { ProtectedAudioProps, ProtectedImageProps } from './media';
export { EmptyState, ErrorState, LoadingState, Skeleton } from './feedback';
export type {
  EmptyStateProps,
  ErrorStateProps,
  LoadingStateProps,
  SkeletonProps,
} from './feedback';
export { BarList, ColumnChart, DonutChart, donutShare, LineChart, niceTicks } from './charts';
export type { ChartDatum, DonutDatum } from './charts';
