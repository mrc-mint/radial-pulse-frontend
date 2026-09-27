import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ModalBaseProps } from '../shared';
import { IconButton } from './button';
import { CloseIcon, cx } from './internal';
import './overlay.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;

/**
 * Modal dialog behaviour shared by Modal and Drawer: portal, initial focus,
 * focus trap, Escape to close, focus restore and body scroll lock.
 */
function DialogFrame({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  kind,
  size,
}: ModalBaseProps & { kind: 'modal' | 'drawer'; size: 'sm' | 'md' | 'lg' }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const id = useId();
  const titleId = `rp-dialog-${id}-title`;
  const descriptionId = description ? `rp-dialog-${id}-description` : undefined;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Explicit autofocus, else the first control in the body, else the dialog
    // itself (so screen readers announce the title) — never the close button.
    const initial =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel?.querySelector('.rp-dialog__body')?.querySelector<HTMLElement>(FOCUSABLE) ??
      panel;
    initial?.focus();

    scrollLocks += 1;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className={cx('rp-overlay', `rp-overlay--${kind}`)} onKeyDown={onKeyDown}>
      <div className="rp-overlay__scrim" aria-hidden="true" onClick={() => onCloseRef.current()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cx('rp-dialog', `rp-dialog--${kind}`, `rp-dialog--${size}`)}
      >
        <header className="rp-dialog__header">
          <div className="rp-dialog__heading">
            <h2 id={titleId} className="rp-dialog__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="rp-dialog__description">
                {description}
              </p>
            )}
          </div>
          <IconButton
            icon={<CloseIcon />}
            label="Close"
            size="sm"
            onClick={() => onCloseRef.current()}
          />
        </header>
        <div className="rp-dialog__body">{children}</div>
        {footer && <footer className="rp-dialog__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export interface ModalProps extends ModalBaseProps {
  size?: 'sm' | 'md' | 'lg';
}

/** Centered dialog for short, focused tasks (confirmations, small forms). */
export function Modal({ size = 'md', ...props }: ModalProps) {
  return <DialogFrame {...props} kind="modal" size={size} />;
}

export interface DrawerProps extends ModalBaseProps {
  size?: 'sm' | 'md' | 'lg';
}

/** Right-side panel for longer tasks that keep page context (e.g. editing a clinic). */
export function Drawer({ size = 'md', ...props }: DrawerProps) {
  return <DialogFrame {...props} kind="drawer" size={size} />;
}
