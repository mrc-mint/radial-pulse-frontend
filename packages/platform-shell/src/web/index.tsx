import type { ReactNode } from 'react';

/**
 * Web platform shell. PHASE 2 STUB: renders children only.
 * Phase 5: sidebar + header built from resolveNavigation(), ClinicLayout,
 * forbidden/error/empty states. Phase 7: SessionProvider (Amplify, managed
 * login, tokens in sessionStorage).
 */
export function WebAppShell({ children }: { children: ReactNode }) {
  return <div data-rp-shell="web">{children}</div>;
}
