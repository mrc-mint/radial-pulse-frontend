/**
 * @radial-pulse/ui/web — DOM implementations. Presentational only: components
 * receive data and never fetch.
 *
 * Styling is plain CSS over the token variables; the app must load
 * `@radial-pulse/design-tokens/css` once at the root. Component styles are
 * imported by each component module (hence `sideEffects: ["*.css"]`).
 */
import './base.css';

export type * from '../shared';
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
} from '../shared';
export * from '../shared/tones';
export { findingCardProps, sortByPriority } from '../shared/findings';

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
export { EmptyState, ErrorState, LoadingState, Skeleton } from './feedback';
export type {
  EmptyStateProps,
  ErrorStateProps,
  LoadingStateProps,
  SkeletonProps,
} from './feedback';
export { BarList, ColumnChart, niceTicks } from './charts';
export type { ChartDatum } from './charts';
