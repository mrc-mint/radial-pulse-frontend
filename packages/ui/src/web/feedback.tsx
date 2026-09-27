import type {
  EmptyStateBaseProps,
  ErrorStateBaseProps,
  LoadingStateBaseProps,
  SkeletonBaseProps,
} from '../shared';
import { Button, Spinner } from './button';
import './feedback.css';
import { AlertIcon, cx, InboxIcon } from './internal';

interface StateLayout {
  /** `inline` sits inside a card or table; `page` fills a content area. */
  variant?: 'inline' | 'page';
  className?: string;
}

export interface EmptyStateProps extends EmptyStateBaseProps, StateLayout {}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'inline',
  className,
}: EmptyStateProps) {
  return (
    <div className={cx('rp-state', `rp-state--${variant}`, className)}>
      <div className="rp-state__icon" aria-hidden="true">
        {icon ?? <InboxIcon size={22} />}
      </div>
      <p className="rp-state__title">{title}</p>
      {description && <p className="rp-state__description">{description}</p>}
      {action && <div className="rp-state__action">{action}</div>}
    </div>
  );
}

export interface LoadingStateProps extends LoadingStateBaseProps, StateLayout {}

export function LoadingState({
  label = 'Loading…',
  variant = 'inline',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cx('rp-state', `rp-state--${variant}`, className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size={24} />
      <p className="rp-state__description">{label}</p>
    </div>
  );
}

export interface ErrorStateProps extends ErrorStateBaseProps, StateLayout {
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this information. Please try again.',
  retryLabel = 'Try again',
  requestId,
  onRetry,
  variant = 'inline',
  className,
}: ErrorStateProps) {
  return (
    <div className={cx('rp-state', `rp-state--${variant}`, className)} role="alert">
      <div className="rp-state__icon rp-state__icon--danger" aria-hidden="true">
        <AlertIcon size={22} />
      </div>
      <p className="rp-state__title">{title}</p>
      <p className="rp-state__description">{description}</p>
      {requestId && (
        <p className="rp-state__meta">
          Reference: <code>{requestId}</code>
        </p>
      )}
      {onRetry && (
        <div className="rp-state__action">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export interface SkeletonProps extends SkeletonBaseProps {
  className?: string;
}

/** Decorative placeholder. Pair with a LoadingState or aria-busy container. */
export function Skeleton({ width = '100%', height = 14, radius = 'sm', className }: SkeletonProps) {
  return (
    <span
      className={cx('rp-skeleton', className)}
      style={{ width, height, borderRadius: `var(--rp-radius-${radius})` }}
      aria-hidden="true"
    />
  );
}
