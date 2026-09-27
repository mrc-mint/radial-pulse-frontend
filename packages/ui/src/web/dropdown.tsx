import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { ButtonVariant } from '../shared';
import { Button, IconButton } from './button';
import './dropdown.css';
import { ChevronDownIcon, cx, MoreIcon } from './internal';

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

const GAP = 4;

/**
 * Action menu (WAI-ARIA menu button). Rendered in a portal with fixed
 * positioning so table scroll containers never clip it.
 */
export function DropdownMenu({
  label,
  items,
  trigger = 'icon',
  triggerVariant = trigger === 'icon' ? 'ghost' : 'secondary',
  align = 'end',
  size = 'md',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<'first' | 'last'>('first');
  const menuId = `rp-menu-${useId()}`;

  const itemEls = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ??
        [],
    );

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function openWith(focus: 'first' | 'last') {
    focusOnOpen.current = focus;
    setOpen(true);
  }

  // Position against the trigger, flipping above when there is no room below.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const below = rect.bottom + GAP;
    const top =
      below + menuHeight > window.innerHeight && rect.top - GAP - menuHeight > 0
        ? rect.top - GAP - menuHeight
        : below;
    setStyle(
      align === 'end'
        ? { top, right: Math.max(GAP, window.innerWidth - rect.right) }
        : { top, left: Math.max(GAP, rect.left) },
    );
    const els = Array.from(
      menuRef.current.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
    );
    (focusOnOpen.current === 'first' ? els[0] : els[els.length - 1])?.focus();
  }, [open, align]);

  // Close on outside pointer, scroll or resize.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onViewportChange = (e: Event) => {
      if (e.target instanceof Node && menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openWith(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const els = itemEls();
    const index = els.indexOf(document.activeElement as HTMLButtonElement);
    const move = (i: number) => els[(i + els.length) % els.length]?.focus();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        move(0);
        break;
      case 'End':
        event.preventDefault();
        move(els.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case 'Tab':
        close(false);
        break;
    }
  }

  const triggerProps = {
    ref: triggerRef,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: () => (open ? close(false) : openWith('first')),
    onKeyDown: onTriggerKeyDown,
  };

  return (
    <>
      {trigger === 'icon' ? (
        <IconButton
          {...triggerProps}
          icon={<MoreIcon />}
          label={label}
          variant={triggerVariant}
          size={size}
        />
      ) : (
        <Button
          {...triggerProps}
          variant={triggerVariant}
          size={size}
          trailingIcon={<ChevronDownIcon />}
        >
          {label}
        </Button>
      )}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className="rp-menu"
            style={style}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                className={cx('rp-menu__item', item.tone === 'danger' && 'rp-menu__item--danger')}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                {item.icon && <span className="rp-menu__icon">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
