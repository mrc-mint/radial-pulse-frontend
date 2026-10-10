import { Avatar, Badge, IconButton } from '@radial-pulse/web-ui';
import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { isRouteActive, type ResolvedNavEntry } from '@radial-pulse/shell-core';
import './app-shell.css';
import { Brand } from './brand';
import type { RenderLink } from './link';
import { NAV_ICONS } from './nav-icons';

export interface ShellUser {
  name: string;
  /** Display label of the user's role, e.g. "Digital Success Manager". */
  roleLabel: string | null;
  avatarUrl?: string | null;
}

export interface WebAppShellProps {
  /** Output of resolveNavigation() for the current user's capabilities. */
  nav: ReadonlyArray<ResolvedNavEntry>;
  /** Current location pathname, from the app's router. */
  pathname: string;
  renderLink: RenderLink;
  user: ShellUser;
  onSignOut: () => void;
  /** Non-production environment label ("Local", "Dev"). Omit in prod. */
  environmentLabel?: string | null;
  /** Page-level header content, e.g. breadcrumbs (left) or filters (right). */
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
  children: ReactNode;
}

/** Below this width the sidebar is an off-canvas drawer (tokens.breakpoint.md). */
const DRAWER_QUERY = '(max-width: 767.98px)';

/**
 * Authenticated web layout: sidebar navigation, header and content area.
 *
 *   ≥ 1024px  full sidebar
 *   768–1023  icon rail (labels as tooltips; still the accessible names)
 *   < 768     off-canvas drawer: modal while open, closes on Escape, scrim
 *             click, navigation, or growing past the breakpoint
 */
export function WebAppShell({
  nav,
  pathname,
  renderLink,
  user,
  onSignOut,
  environmentLabel,
  headerStart,
  headerEnd,
  children,
}: WebAppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarId = `rp-sidebar-${useId()}`;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Navigating closes the drawer.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Focus moves into the drawer on open and back to the toggle on close.
  useEffect(() => {
    if (menuOpen) closeRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(DRAWER_QUERY) : null;
    const onMedia = (e: MediaQueryListEvent) => {
      if (!e.matches) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    media?.addEventListener('change', onMedia);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      media?.removeEventListener('change', onMedia);
    };
  }, [menuOpen]);

  const primary = nav.filter((e) => e.placement === 'primary');
  const secondary = nav.filter((e) => e.placement === 'secondary');
  const close = () => setMenuOpen(false);

  const renderItem = (entry: ResolvedNavEntry) => {
    const Icon = NAV_ICONS[entry.icon];
    const exact = pathname.replace(/\/+$/, '') === entry.to;
    const active = isRouteActive(entry.to, pathname);
    return (
      <li key={entry.id}>
        {renderLink({
          to: entry.to,
          className: 'rp-nav__link',
          'aria-current': active ? (exact ? 'page' : 'true') : undefined,
          onClick: close,
          children: (
            <>
              <Icon size={18} aria-hidden="true" focusable="false" />
              <span className="rp-nav__label">{entry.label}</span>
            </>
          ),
        })}
      </li>
    );
  };

  return (
    <div className="rp-shell" data-menu-open={menuOpen || undefined}>
      <a href="#rp-main" className="rp-shell__skip">
        Skip to main content
      </a>

      <aside
        id={sidebarId}
        className="rp-shell__sidebar"
        aria-label="Sidebar"
        {...(menuOpen ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <div className="rp-shell__brand">
          {renderLink({
            to: primary[0]?.to ?? '/',
            className: 'rp-shell__brand-link',
            'aria-label': 'Radial Pulse home',
            onClick: close,
            children: <Brand />,
          })}
          <IconButton
            ref={closeRef}
            className="rp-shell__close"
            label="Close menu"
            icon={<X size={18} />}
            onClick={close}
          />
        </div>

        <nav aria-label="Main" className="rp-nav">
          <ul className="rp-nav__list">{primary.map(renderItem)}</ul>
        </nav>
        {secondary.length > 0 && (
          <nav aria-label="Secondary" className="rp-nav rp-nav--secondary">
            <ul className="rp-nav__list">{secondary.map(renderItem)}</ul>
          </nav>
        )}

        <div className="rp-shell__user">
          <Avatar name={user.name} src={user.avatarUrl} size="md" decorative />
          <div className="rp-shell__user-text">
            <span className="rp-shell__user-name">{user.name}</span>
            {user.roleLabel && <span className="rp-shell__user-role">{user.roleLabel}</span>}
          </div>
          <button type="button" className="rp-shell__signout" onClick={onSignOut}>
            <LogOut size={16} aria-hidden="true" focusable="false" />
            <span className="rp-nav__label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="rp-shell__scrim" aria-hidden="true" onClick={close} />

      <div className="rp-shell__body" inert={menuOpen || undefined}>
        <header className="rp-shell__header">
          <IconButton
            ref={toggleRef}
            className="rp-shell__menu-button"
            label="Open menu"
            aria-expanded={menuOpen}
            aria-controls={sidebarId}
            icon={<Menu size={20} />}
            onClick={() => setMenuOpen(true)}
          />
          <span className="rp-shell__header-brand">
            <Brand tagline={false} />
          </span>
          <div className="rp-shell__header-start">{headerStart}</div>
          <div className="rp-shell__header-end">
            {environmentLabel && (
              <Badge tone="warning" dot>
                {environmentLabel}
              </Badge>
            )}
            {headerEnd}
          </div>
        </header>
        <main id="rp-main" tabIndex={-1} className="rp-shell__main">
          {children}
        </main>
      </div>
    </div>
  );
}
