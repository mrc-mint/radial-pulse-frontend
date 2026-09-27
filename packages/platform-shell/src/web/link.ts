import type { ReactNode } from 'react';

/**
 * The shell renders navigation without depending on a router. The app passes
 * `renderLink`, which wraps its router's link component (TanStack Router on
 * web), so client-side navigation and preloading keep working.
 */
export interface ShellLinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  /** 'page' for the current page, 'true' for an ancestor section of it. */
  'aria-current'?: 'page' | 'true';
  'aria-label'?: string;
  onClick?: () => void;
}

export type RenderLink = (props: ShellLinkProps) => ReactNode;
