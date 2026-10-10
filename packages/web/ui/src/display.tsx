import { useState, type ComponentPropsWithRef } from 'react';
import {
  avatarToneFor,
  getInitials,
  type AvatarBaseProps,
  type BadgeBaseProps,
  type CardBaseProps,
  type PageHeaderBaseProps,
} from '@radial-pulse/ui-shared';
import './display.css';
import { cx } from './internal';

// ── Card ────────────────────────────────────────────────────────────────────

export interface CardProps
  extends CardBaseProps, Omit<ComponentPropsWithRef<'section'>, 'title' | 'children'> {
  /** Heading level of the card title, to keep the page outline correct. */
  titleAs?: 'h2' | 'h3' | 'h4';
}

export function Card({
  title,
  description,
  actions,
  padding = 'md',
  titleAs: Title = 'h2',
  children,
  className,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(title || actions);
  return (
    <section {...rest} className={cx('rp-card', `rp-card--pad-${padding}`, className)}>
      {hasHeader && (
        <header className="rp-card__header">
          <div className="rp-card__heading">
            {title && <Title className="rp-card__title">{title}</Title>}
            {description && <p className="rp-card__description">{description}</p>}
          </div>
          {actions && <div className="rp-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────

export interface BadgeProps
  extends BadgeBaseProps, Omit<ComponentPropsWithRef<'span'>, 'children'> {}

export function Badge({
  tone = 'neutral',
  dot,
  size = 'md',
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span {...rest} className={cx('rp-badge', `rp-tone-${tone}`, `rp-badge--${size}`, className)}>
      {dot && <span className="rp-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────

export interface AvatarProps extends AvatarBaseProps {
  className?: string;
  /** Set when the name is already visible next to the avatar. */
  decorative?: boolean;
}

export function Avatar({ name, src, size = 'md', decorative, className }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(src) && failed !== src;
  return (
    <span
      className={cx('rp-avatar', `rp-avatar--${size}`, className)}
      data-tone={avatarToneFor(name)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {showImage ? (
        <img src={src ?? undefined} alt="" onError={() => setFailed(src ?? null)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}

// ── PageHeader ──────────────────────────────────────────────────────────────

export interface PageHeaderProps extends PageHeaderBaseProps {
  className?: string;
}

export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <header className={cx('rp-page-header', className)}>
      <div className="rp-page-header__main">
        {back && <div className="rp-page-header__back">{back}</div>}
        <div className="rp-page-header__text">
          <h1 className="rp-page-header__title">{title}</h1>
          {description && <p className="rp-page-header__description">{description}</p>}
        </div>
      </div>
      {actions && <div className="rp-page-header__actions">{actions}</div>}
    </header>
  );
}
