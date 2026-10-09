import { useEffect, useId, useRef } from 'react';
import { Dialog, Heading, Modal as AriaModal, ModalOverlay } from 'react-aria-components';
import type { ModalBaseProps } from '../shared';
import { IconButton } from './button';
import { CloseIcon } from './internal';
import { cn } from './lib/utils';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Kind = 'modal' | 'drawer';
type Size = 'sm' | 'md' | 'lg';

const PANEL: Record<Kind, Record<Size, string>> = {
  modal: {
    sm: 'max-w-[420px]',
    md: 'max-w-modal',
    lg: 'max-w-[760px]',
  },
  drawer: {
    sm: 'w-[min(380px,100%)]',
    md: 'w-[min(var(--rp-layout-drawer-width),100%)]',
    lg: 'w-[min(640px,100%)]',
  },
};

/**
 * Modal dialog shared by Modal and Drawer. React Aria provides the behaviour
 * (portal, focus containment and restore, Escape and outside-press to close,
 * scroll lock, hiding the rest of the page from assistive tech); this
 * component adds the Radial Pulse layout and initial focus in the body.
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
}: ModalBaseProps & { kind: Kind; size: Size }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const descriptionId = `rp-dialog-${useId()}-description`;

  // Initial focus: explicit autofocus, else the first control in the body,
  // else the dialog itself (React Aria's default) — never the close button.
  useEffect(() => {
    if (!open) return;
    const body = bodyRef.current;
    const target =
      body?.closest('[role="dialog"]')?.querySelector<HTMLElement>('[data-autofocus]') ??
      body?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  }, [open]);

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      isDismissable
      className={cn(
        'fixed inset-0 z-(--rp-z-index-modal) flex bg-overlay',
        'data-[entering]:animate-rp-fade-in motion-reduce:animate-none',
        kind === 'modal' ? 'items-center justify-center p-6' : 'justify-end',
      )}
    >
      <AriaModal
        className={cn(
          'relative flex max-h-full flex-col bg-surface shadow-xl outline-none motion-reduce:animate-none',
          kind === 'modal'
            ? 'w-full rounded-xl data-[entering]:animate-rp-dialog-in'
            : 'h-full data-[entering]:animate-rp-drawer-in',
          PANEL[kind][size],
        )}
      >
        <Dialog
          aria-describedby={description ? descriptionId : undefined}
          className="flex max-h-full min-h-0 flex-1 flex-col outline-none"
        >
          {({ close }) => (
            <>
              <header
                className={cn(
                  'flex items-start justify-between gap-4 px-6 pt-5 pb-4',
                  kind === 'drawer' && 'border-b border-border-subtle',
                )}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <Heading
                    slot="title"
                    className="m-0 text-h2 font-semibold tracking-(--rp-text-h2-tracking) text-foreground"
                  >
                    {title}
                  </Heading>
                  {description && (
                    <p id={descriptionId} className="m-0 text-body text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                <IconButton icon={<CloseIcon />} label="Close" size="sm" onClick={close} />
              </header>
              <div
                ref={bodyRef}
                className={cn(
                  'min-h-0 flex-1 overflow-y-auto px-6 pb-5 text-body text-secondary-foreground',
                  kind === 'drawer' && 'pt-5',
                )}
              >
                {children}
              </div>
              {footer && (
                <footer className="flex justify-end gap-2 border-t border-border-subtle px-6 py-4">
                  {footer}
                </footer>
              )}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}

export interface ModalProps extends ModalBaseProps {
  size?: Size;
}

/** Centered dialog for short, focused tasks (confirmations, small forms). */
export function Modal({ size = 'md', ...props }: ModalProps) {
  return <DialogFrame {...props} kind="modal" size={size} />;
}

export interface DrawerProps extends ModalBaseProps {
  size?: Size;
}

/** Right-side panel for longer tasks that keep page context (e.g. editing a clinic). */
export function Drawer({ size = 'md', ...props }: DrawerProps) {
  return <DialogFrame {...props} kind="drawer" size={size} />;
}
