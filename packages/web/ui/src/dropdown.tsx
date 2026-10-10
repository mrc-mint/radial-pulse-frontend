import type { ReactNode } from 'react';
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import type { ButtonVariant } from '@radial-pulse/ui-shared';
import { Button, IconButton } from './button';
import { ChevronDownIcon, MoreIcon } from './internal';
import { cn } from './lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

export interface DropdownMenuProps {
  /** Accessible name; also the visible text of a `button` trigger. */
  label: string;
  items: ReadonlyArray<DropdownItem>;
  /** `icon` renders a "⋯" icon button (row actions); `button` a labelled button. */
  trigger?: 'icon' | 'button';
  triggerVariant?: Exclude<ButtonVariant, 'danger'>;
  align?: 'start' | 'end';
  size?: 'sm' | 'md';
}

/**
 * Action menu (WAI-ARIA menu button) from React Aria: arrow keys, Home/End,
 * typeahead, Escape and focus return. The popover is portalled and
 * positioned against the trigger (flips when there is no room), so table
 * scroll containers never clip it.
 */
export function DropdownMenu({
  label,
  items,
  trigger = 'icon',
  triggerVariant = trigger === 'icon' ? 'ghost' : 'secondary',
  align = 'end',
  size = 'md',
}: DropdownMenuProps) {
  const byId = new Map(items.map((i) => [i.id, i]));
  return (
    <MenuTrigger>
      {trigger === 'icon' ? (
        <IconButton icon={<MoreIcon />} label={label} variant={triggerVariant} size={size} />
      ) : (
        <Button variant={triggerVariant} size={size} trailingIcon={<ChevronDownIcon />}>
          {label}
        </Button>
      )}
      <Popover
        placement={align === 'end' ? 'bottom end' : 'bottom start'}
        offset={4}
        className={cn(
          'z-(--rp-z-index-dropdown) min-w-[180px] max-w-[280px] rounded-md border border-border bg-surface p-1 shadow-lg',
          'outline-none data-[entering]:animate-rp-pop-in motion-reduce:animate-none',
        )}
      >
        <Menu
          aria-label={label}
          disabledKeys={items.filter((i) => i.disabled).map((i) => i.id)}
          onAction={(key) => byId.get(String(key))?.onSelect()}
          className="flex flex-col outline-none"
        >
          {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              textValue={item.label}
              className={cn(
                'group flex min-h-[34px] w-full cursor-pointer items-center gap-2 rounded-sm px-3 text-body-sm outline-none',
                item.tone === 'danger' ? 'text-danger' : 'text-foreground',
                'data-[focused]:bg-muted data-[hovered]:bg-muted',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled',
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    'inline-flex',
                    item.tone === 'danger' ? 'text-inherit' : 'text-muted-foreground',
                  )}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
