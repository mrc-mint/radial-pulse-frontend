import type { ComponentPropsWithRef } from 'react';
import type { ButtonBaseProps, ButtonVariant, ControlSize, IconButtonBaseProps } from '../shared';
import './button.css';
import { cx } from './internal';

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ControlSize;
  fullWidth?: boolean;
}

/**
 * Button styling as a class string, so the app can style its router links as
 * buttons without @radial-pulse/ui depending on the router.
 */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth,
}: ButtonClassOptions = {}): string {
  return cx('rp-btn', `rp-btn--${variant}`, `rp-btn--${size}`, fullWidth && 'rp-btn--full');
}

export function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <span
      className="rp-spinner"
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export interface ButtonProps
  extends ButtonBaseProps, Omit<ComponentPropsWithRef<'button'>, 'children' | 'disabled'> {}

export function Button({
  variant,
  size,
  loading = false,
  disabled = false,
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(buttonClassName({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {loading && (
        <span className="rp-btn__spinner">
          <Spinner size={size === 'sm' ? 14 : 16} />
        </span>
      )}
      <span className="rp-btn__content">
        {leadingIcon && <span className="rp-btn__icon">{leadingIcon}</span>}
        <span>{children}</span>
        {trailingIcon && <span className="rp-btn__icon">{trailingIcon}</span>}
      </span>
    </button>
  );
}

export interface IconButtonProps
  extends IconButtonBaseProps, Omit<ComponentPropsWithRef<'button'>, 'children' | 'disabled'> {}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={rest.title ?? label}
      disabled={disabled}
      className={cx(buttonClassName({ variant, size }), 'rp-btn--icon-only', className)}
    >
      <span className="rp-btn__icon">{icon}</span>
    </button>
  );
}
