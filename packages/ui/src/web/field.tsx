import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import type { ControlSize, FieldBaseProps, SelectBaseProps } from '../shared';
import './field.css';
import { ChevronDownIcon, CloseIcon, cx, SearchIcon } from './internal';

interface FieldIds {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

/** Label, hint and error wiring shared by every form control. */
function Field({
  label,
  hideLabel,
  hint,
  error,
  required,
  id,
  children,
}: FieldBaseProps & { id?: string; children: (ids: FieldIds) => ReactNode }) {
  const generated = useId();
  const controlId = id ?? `rp-field-${generated}`;
  // The hint is replaced by the error, so only one of them is ever referenced.
  const hintId = hint && !error ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = errorId ?? hintId;

  return (
    <div className="rp-field">
      <label htmlFor={controlId} className={cx('rp-field__label', hideLabel && 'rp-sr-only')}>
        {label}
        {required && (
          <span className="rp-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ controlId, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="rp-field__error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="rp-field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'size' | 'disabled' | 'required' | 'children'
>;

export interface InputProps extends FieldBaseProps, NativeInputProps {
  size?: ControlSize;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  required,
  disabled,
  size = 'md',
  leading,
  trailing,
  id,
  className,
  ...rest
}: InputProps) {
  return (
    <Field {...{ label, hideLabel, hint, error, required, id }}>
      {({ controlId, describedBy, invalid }) => (
        <div
          className={cx('rp-control', `rp-control--${size}`, className)}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
        >
          {leading && <span className="rp-control__adornment">{leading}</span>}
          <input
            {...rest}
            id={controlId}
            className="rp-control__input"
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
          {trailing && <span className="rp-control__adornment">{trailing}</span>}
        </div>
      )}
    </Field>
  );
}

export interface SearchInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'leading' | 'trailing'
> {
  value: string;
  onValueChange: (value: string) => void;
  clearLabel?: string;
}

/** Search field with a leading icon and a clear button. Label hidden by default. */
export function SearchInput({
  value,
  onValueChange,
  hideLabel = true,
  clearLabel = 'Clear search',
  ...rest
}: SearchInputProps) {
  return (
    <Input
      {...rest}
      type="search"
      hideLabel={hideLabel}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value) {
          e.preventDefault();
          onValueChange('');
        }
        rest.onKeyDown?.(e);
      }}
      leading={<SearchIcon />}
      trailing={
        value ? (
          <button
            type="button"
            className="rp-control__clear rp-focusable"
            aria-label={clearLabel}
            onClick={() => onValueChange('')}
          >
            <CloseIcon size={14} />
          </button>
        ) : undefined
      }
    />
  );
}

export interface SelectProps<V extends string = string>
  extends
    SelectBaseProps<V>,
    Omit<
      ComponentPropsWithRef<'select'>,
      'value' | 'onChange' | 'size' | 'disabled' | 'required' | 'children' | 'defaultValue'
    > {
  size?: ControlSize;
}

/** Styled native <select>: full keyboard and screen-reader support for free. */
export function Select<V extends string = string>({
  label,
  hideLabel,
  hint,
  error,
  required,
  disabled,
  options,
  value,
  onChange,
  placeholder,
  size = 'md',
  id,
  className,
  ...rest
}: SelectProps<V>) {
  return (
    <Field {...{ label, hideLabel, hint, error, required, id }}>
      {({ controlId, describedBy, invalid }) => (
        <div
          className={cx('rp-control', 'rp-control--select', `rp-control--${size}`, className)}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
        >
          <select
            {...rest}
            id={controlId}
            className="rp-control__input"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value as V)}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          >
            {(value === null || placeholder) && (
              <option value="" disabled hidden={value !== null}>
                {placeholder ?? 'Select…'}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="rp-control__adornment rp-control__chevron">
            <ChevronDownIcon />
          </span>
        </div>
      )}
    </Field>
  );
}
