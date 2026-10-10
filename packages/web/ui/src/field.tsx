import { cva } from 'class-variance-authority';
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Text,
} from 'react-aria-components';
import type { ControlSize, FieldBaseProps, SelectBaseProps } from '@radial-pulse/ui-shared';
import './field.css';
import { ChevronDownIcon, CloseIcon, SearchIcon } from './internal';
import { cn } from './lib/utils';

interface FieldIds {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

/**
 * Label, hint and error wiring shared by Input and SearchInput. The
 * `rp-field*` classes (field.css) are kept on purpose: app forms reuse them
 * for their own labelled groups.
 */
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
      <label htmlFor={controlId} className={cn('rp-field__label', hideLabel && 'rp-sr-only')}>
        {label}
        {required && <RequiredMark />}
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

function RequiredMark() {
  return (
    <span className="rp-field__required" aria-hidden="true">
      *
    </span>
  );
}

/** The bordered control box shared by inputs and the select trigger. */
const controlVariants = cva(
  [
    'relative flex items-center gap-2 border border-border bg-surface px-3 text-foreground',
    'rounded-md transition-[border-color,box-shadow] duration-(--rp-motion-duration-fast) ease-standard',
    'hover:not-data-[disabled]:border-border-strong',
    'data-[invalid]:border-(--rp-color-status-danger-solid)',
    'data-[disabled]:bg-muted data-[disabled]:text-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'h-(--rp-size-control-sm) rounded-sm',
        md: 'h-(--rp-size-control-md)',
        lg: 'h-(--rp-size-control-lg)',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const adornment = 'inline-flex shrink-0 text-muted-foreground';

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'size' | 'disabled' | 'required' | 'children'
>;

export interface InputProps extends FieldBaseProps, NativeInputProps {
  size?: ControlSize;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/**
 * Text input. A native <input> already has the right semantics and keyboard
 * behaviour, so no React Aria wrapper: only the styling is Tailwind.
 */
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
          className={cn(
            controlVariants({ size }),
            'focus-within:border-ring focus-within:shadow-focus',
            className,
          )}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
        >
          {leading && <span className={adornment}>{leading}</span>}
          <input
            {...rest}
            id={controlId}
            className={cn(
              'h-full min-w-0 flex-1 border-0 bg-transparent p-0 [font-family:inherit] text-body text-inherit outline-none',
              'placeholder:text-disabled disabled:cursor-not-allowed',
              '[&::-webkit-search-cancel-button]:appearance-none',
            )}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
          {trailing && <span className={adornment}>{trailing}</span>}
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
          <AriaButton
            aria-label={clearLabel}
            onPress={() => onValueChange('')}
            className={cn(
              'inline-flex size-5 cursor-pointer items-center justify-center rounded-full border-0 bg-muted p-0',
              'text-secondary-foreground outline-none hover:bg-border focus-visible:shadow-focus',
            )}
          >
            <CloseIcon size={14} />
          </AriaButton>
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

/**
 * React Aria select: a button that opens a listbox popover. Typeahead, arrow
 * keys, Home/End, Escape and focus return come from React Aria; a hidden
 * native <select> keeps form submission and autofill working.
 */
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
  name,
  autoFocus,
}: SelectProps<V>) {
  return (
    <AriaSelect
      id={id}
      name={name}
      autoFocus={autoFocus}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key) as V);
      }}
      placeholder={placeholder ?? 'Select…'}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={Boolean(error)}
      disabledKeys={options.filter((o) => o.disabled).map((o) => o.value)}
      validationBehavior="aria"
      className="group rp-field"
    >
      <Label className={cn('rp-field__label', hideLabel && 'rp-sr-only')}>
        {label}
        {required && <RequiredMark />}
      </Label>
      <AriaButton
        className={cn(
          controlVariants({ size }),
          'w-full cursor-pointer pr-3 text-left text-body outline-none [font-family:inherit]',
          'focus-visible:border-ring focus-visible:shadow-focus',
          'group-data-[invalid]:border-(--rp-color-status-danger-solid)',
          'disabled:cursor-not-allowed disabled:bg-muted disabled:text-disabled',
          className,
        )}
      >
        <SelectValue className="min-w-0 flex-1 truncate text-body data-[placeholder]:text-disabled" />
        <span className={adornment}>
          <ChevronDownIcon />
        </span>
      </AriaButton>
      {error ? (
        <Text slot="errorMessage" className="rp-field__error">
          {error}
        </Text>
      ) : (
        hint && (
          <Text slot="description" className="rp-field__hint">
            {hint}
          </Text>
        )
      )}
      <Popover
        offset={4}
        className={cn(
          'z-(--rp-z-index-dropdown) max-h-72 min-w-(--trigger-width) overflow-auto rounded-md border border-border',
          'bg-surface p-1 shadow-lg outline-none data-[entering]:animate-rp-pop-in motion-reduce:animate-none',
        )}
      >
        <ListBox className="outline-none">
          {options.map((o) => (
            <ListBoxItem
              key={o.value}
              id={o.value}
              textValue={o.label}
              className={cn(
                'flex cursor-pointer items-center rounded-sm px-3 py-2 text-body text-foreground outline-none',
                'data-[focused]:bg-hover data-[selected]:font-semibold data-[selected]:text-brand',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled',
              )}
            >
              {o.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
