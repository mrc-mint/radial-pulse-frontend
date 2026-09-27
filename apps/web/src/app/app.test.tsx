// @vitest-environment jsdom
import { createConfig } from '@radial-pulse/config';
import { createSessionController } from '@radial-pulse/platform-shell/core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from '@tanstack/react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { App } from './app';
import { createAppRouter } from './router';
import { createDevSessionAdapter, type DevPersonaId } from './session/dev-session';

// jsdom has no layout; the router's scroll restoration calls scrollTo.
beforeAll(() => {
  window.scrollTo = () => {};
});
afterEach(cleanup);

const config = createConfig({
  appEnv: 'local',
  apiBaseUrl: 'https://api.dev.radialpulse.example',
  cognito: { userPoolId: 'pool', userPoolClientId: 'client', domain: 'auth.example' },
});

async function renderApp(path: string, persona?: DevPersonaId) {
  const storage = new Map<string, string>();
  const adapter = createDevSessionAdapter(config, {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => void storage.set(k, v),
    removeItem: (k) => void storage.delete(k),
  });
  const session = createSessionController(adapter);
  if (persona) await session.signIn(persona);
  else await session.restore();
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(<App config={config} session={session} router={router} />);
  return router;
}

const mainNav = async () => within(await screen.findByRole('navigation', { name: 'Main' }));
const navLabels = async () => (await mainNav()).getAllByRole('link').map((l) => l.textContent);

describe('web app shell', () => {
  it('sends signed-out users to sign-in and back to where they were going', async () => {
    const router = await renderApp('/clinics');
    await screen.findByRole('heading', { name: 'Sign in' });
    expect(router.state.location.pathname).toBe('/sign-in');

    await userEvent.click(
      screen.getByRole('button', { name: /Continue as Digital Success Manager/ }),
    );
    expect(await screen.findByRole('heading', { name: 'My Clinics', level: 1 })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/clinics');
  });

  it('gives a Platform Administrator the full navigation', async () => {
    await renderApp('/dashboard', 'platform-administrator');
    expect(await navLabels()).toEqual([
      'Dashboard',
      'Clinics',
      'Users',
      'Audit Reports',
      'Settings',
    ]);
    expect(
      (await mainNav()).getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.getByText('Rohan Agarwal')).toBeTruthy();
    expect(screen.getByText('Local')).toBeTruthy();
  });

  it('gives a Digital Success Manager the assigned-clinic navigation', async () => {
    await renderApp('/dashboard', 'digital-success-manager');
    expect(await navLabels()).toEqual(['Dashboard', 'My Clinics', 'Audit Reports', 'Settings']);
    expect(screen.getByText('Digital Success Manager')).toBeTruthy();
  });

  it('blocks Users for roles without the capability', async () => {
    await renderApp('/users', 'digital-success-manager');
    expect(await screen.findByText('You don’t have access to this page')).toBeTruthy();
  });

  it('redirects the root to the dashboard', async () => {
    const router = await renderApp('/', 'platform-administrator');
    await screen.findByRole('heading', { name: 'Dashboard', level: 1 });
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('scopes clinic routes to the clinic in the URL', async () => {
    await renderApp('/clinics/clinic_smile_dental/chat', 'digital-success-manager');
    const sections = within(await screen.findByRole('navigation', { name: 'Clinic sections' }));
    expect(sections.getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Overview',
      'Digital Information',
      'Unified Audit',
      'Social Media',
      'Chat',
    ]);
    expect(sections.getByRole('link', { name: 'Chat' }).getAttribute('aria-current')).toBe('page');
    expect((await screen.findByTestId('clinic-scope')).textContent).toBe(
      'Scoped to clinic clinic_smile_dental',
    );
    // The sidebar keeps "My Clinics" active while inside a clinic.
    expect(
      (await mainNav()).getByRole('link', { name: 'My Clinics' }).getAttribute('aria-current'),
    ).toBe('true');
    expect(screen.getByRole('link', { name: 'Back to My Clinics' }).getAttribute('href')).toBe(
      '/clinics',
    );
  });

  it('switching clinics re-scopes the workspace', async () => {
    const router = await renderApp('/clinics/clinic_a', 'platform-administrator');
    expect((await screen.findByTestId('clinic-scope')).textContent).toContain('clinic_a');
    await router.navigate({ to: '/clinics/$clinicId', params: { clinicId: 'clinic_b' } });
    expect((await screen.findByTestId('clinic-scope')).textContent).toContain('clinic_b');
  });

  it('shows not found for unknown routes', async () => {
    await renderApp('/does-not-exist', 'platform-administrator');
    expect(await screen.findByText('Page not found')).toBeTruthy();
  });

  it('signs out to the sign-in screen', async () => {
    const router = await renderApp('/settings', 'platform-administrator');
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    await screen.findByRole('heading', { name: 'Sign in' });
    expect(router.state.location.pathname).toBe('/sign-in');
  });
});
