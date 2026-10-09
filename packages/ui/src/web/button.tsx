import { cva } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import type { ButtonBaseProps, ButtonVariant, ControlSize, IconButtonBaseProps } from '../shared';
import { cn } from './lib/utils';

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ControlSize;
  fullWidth?: boolean;
}

/**
 * Button look (shadcn-style cva). Plain CSS pseudo-classes rather than React
 * Aria data attributes, so the same classes style router links via
 * `buttonClassName`.
 */
const buttonVariants = cva(
  [
    'group relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md border border-transparent [font-family:inherit] font-semibold no-underline',
    'cursor-pointer select-none outline-none',
    'transition-[background-color,box-shadow] duration-(--rp-motion-duration-fast) ease-standard',
    'focus-visible:shadow-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[pending]:cursor-progress',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:not-disabled:bg-primary-hover active:not-disabled:bg-primary-active',
        secondary:
          'border-secondary-border bg-secondary text-secondary-action-foreground shadow-xs hover:not-disabled:bg-secondary-hover active:not-disabled:bg-secondary-active',
        ghost:
          'bg-transparent text-ghost-foreground hover:not-disabled:bg-ghost-hover active:not-disabled:bg-ghost-active',
        danger:
          'bg-destructive text-destructive-foreground hover:not-disabled:bg-destructive-hover active:not-disabled:bg-destructive-active',
      },
      size: {
        sm: 'h-(--rp-size-control-sm) gap-1.5 rounded-sm px-3 text-caption',
        md: 'h-(--rp-size-control-md) px-4 text-label',
        lg: 'h-(--rp-size-control-lg) px-5 text-body',
      },
      fullWidth: { true: 'w-full' },
      iconOnly: { true: 'px-0' },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', class: 'w-(--rp-size-control-sm)' },
      { iconOnly: true, size: 'md', class: 'w-(--rp-size-control-md)' },
      { iconOnly: true, size: 'lg', class: 'w-(--rp-size-control-lg)' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

/**
 * Button styling as a class string, so the app can style its router links as
 * buttons without @radial-pulse/ui depending on the router.
 */
export function buttonClassName({ variant, size, fullWidth }: ButtonClassOptions = {}): string {
  return cn(buttonVariants({ variant, size, fullWidth }));
}

export function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <span
      className="inline-block shrink-0 animate-rp-spin rounded-full border-2 border-current border-r-transparent"
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

type NativeButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'disabled' | 'className' | 'style'
>;

/** Props React Aria's Button accepts as-is (the rest of the native props are dropped). */
function ariaButtonProps({
  onClick,
  type,
  form,
  id,
  ref,
  autoFocus,
  name,
  value,
  ...rest
}: NativeButtonProps): AriaButtonProps & { ref?: NativeButtonProps['ref'] } {
  const aria = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('aria-') || key.startsWith('data-')),
  );
  return {
    ...aria,
    ref,
    id,
    type,
    form,
    autoFocus,
    name,
    value: typeof value === 'string' ? value : undefined,
    // React Aria types these handlers for any Element; the target is this button.
    onClick: onClick as AriaButtonProps['onClick'],
    onKeyDown: rest.onKeyDown as AriaButtonProps['onKeyDown'],
    onFocus: rest.onFocus as AriaButtonProps['onFocus'],
    onBlur: rest.onBlur as AriaButtonProps['onBlur'],
  };
}

export interface ButtonProps extends ButtonBaseProps, NativeButtonProps {
  className?: string;
}

/**
 * React Aria button: consistent press handling across mouse, touch and
 * keyboard, and `focus-visible` only for keyboard focus. While `loading` it
 * stays focusable, ignores presses and is announced as busy.
 */
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
  title,
  ...rest
}: ButtonProps) {
  return (
    <AriaButton
      {...ariaButtonProps({ ...rest, type })}
      isDisabled={disabled}
      isPending={loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === 'sm' ? 14 : 16} />
        </span>
      )}
      <span
        className="inline-flex items-center gap-[inherit] group-data-[pending]:invisible"
        title={title}
      >
        {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
        <span>{children}</span>
        {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
      </span>
    </AriaButton>
  );
}

export interface IconButtonProps extends IconButtonBaseProps, NativeButtonProps {
  className?: string;
}

/** Square icon-only button. `label` is its accessible name and its tooltip. */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled,
  className,
  type = 'button',
  title,
  ...rest
}: IconButtonProps) {
  return (
    <AriaButton
      {...ariaButtonProps({ ...rest, type })}
      aria-label={label}
      isDisabled={disabled}
      className={cn(buttonVariants({ variant, size, iconOnly: true }), className)}
    >
      <span
        className="inline-flex h-full w-full items-center justify-center"
        title={title ?? label}
      >
        <span className="inline-flex shrink-0">{icon}</span>
      </span>
    </AriaButton>
  );
}
