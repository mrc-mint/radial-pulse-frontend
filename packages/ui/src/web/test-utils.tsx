import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Minimal DOM test harness (react-dom + act) so the UI package needs no extra
 * testing dependencies. Test-only: not exported from the package entry.
 */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted = new Set<() => void>();

export function render(ui: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  const unmount = () => {
    act(() => root.unmount());
    container.remove();
    mounted.delete(unmount);
  };
  mounted.add(unmount);
  return {
    container,
    rerender: (next: ReactNode) => act(() => root.render(next)),
    unmount,
  };
}

export function cleanup() {
  for (const unmount of [...mounted]) unmount();
  document.body.innerHTML = '';
}

export function click(el: Element | null | undefined) {
  if (!(el instanceof HTMLElement)) throw new Error('click: element not found');
  act(() => el.click());
}

export function keyDown(el: Element | null | undefined, key: string, init: KeyboardEventInit = {}) {
  if (!el) throw new Error(`keyDown(${key}): element not found`);
  act(() => {
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    );
  });
}

/** Finds an element by role and accessible name (aria-label or text). */
export function getByRole(role: string, name?: string | RegExp, root: ParentNode = document) {
  const selector = [`[role="${role}"]`, IMPLICIT_ROLES[role]].filter(Boolean).join(', ');
  const all = Array.from(root.querySelectorAll<HTMLElement>(selector));
  const match = all.find((el) => {
    if (name === undefined) return true;
    const label = el.getAttribute('aria-label') ?? el.textContent ?? '';
    return typeof name === 'string' ? label.trim() === name : name.test(label);
  });
  if (!match) throw new Error(`No ${role} named ${String(name)}`);
  return match;
}

const IMPLICIT_ROLES: Record<string, string> = {
  button: 'button:not([role])',
  link: 'a[href]',
  textbox: 'input:not([type]), input[type="text"], input[type="search"]',
  combobox: 'select',
  table: 'table',
};
