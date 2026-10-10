import { createContext, useContext, type ReactNode } from 'react';

/** A navigation entry's id and the label the signed-in user sees for it. */
export interface NavLabel {
  id: string;
  label: string;
}

const NavLabelsContext = createContext<ReadonlyArray<NavLabel>>([]);

/**
 * Supplied by the app shell with the resolved navigation for the signed-in
 * user, so feature pages can name other sections (e.g. "My Client Portfolio")
 * without importing the app's module registry.
 */
export function NavLabelsProvider({
  entries,
  children,
}: {
  entries: ReadonlyArray<NavLabel>;
  children: ReactNode;
}) {
  return <NavLabelsContext.Provider value={entries}>{children}</NavLabelsContext.Provider>;
}

/** The label the current user sees for a nav entry (e.g. "My Client Portfolio"). */
export function useNavLabel(id: string, fallback: string): string {
  return useContext(NavLabelsContext).find((e) => e.id === id)?.label ?? fallback;
}
