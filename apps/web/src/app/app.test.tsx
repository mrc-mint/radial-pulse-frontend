// @vitest-environment jsdom
import {
  createMockDb,
  createMockHandlers,
  MOCK_PERSONAS,
  MOCK_TOKEN_PREFIX,
  type PersonaId,
} from '@radial-pulse/api-client/mocks';
import { createConfig } from '@radial-pulse/config';
import { createAppServices, createMockAuth } from '@radial-pulse/platform-shell/core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from '@tanstack/react-router';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { App } from './app';
import { createAppRouter } from './router';

const config = createConfig({
  appEnv: 'local',
  apiBaseUrl: 'https://api.dev.radialpulse.example',
  cognito: { userPoolId: 'pool', userPoolClientId: 'client', domain: 'auth.example' },
  apiMocking: true,
});

// Contract mocks (packages/api-client/src/mocks), fresh data per test.
const server = setupServer();

beforeAll(() => {
  // jsdom has no layout; the router's scroll restoration calls scrollTo.
  window.scrollTo = () => {};
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

const SMILE = 'c1000000-0000-4000-8000-000000000001';
const BRIGHT = 'c1000000-0000-4000-8000-000000000002';

async function renderApp(path: string, persona?: PersonaId) {
  server.use(...createMockHandlers({ baseUrl: config.apiBaseUrl, db: createMockDb() }));
  const storage = new Map<string, string>();
  const auth = createMockAuth(config, MOCK_PERSONAS, MOCK_TOKEN_PREFIX, {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => void storage.set(k, v),
    removeItem: (k) => void storage.delete(k),
  });
  // jsdom replaces AbortSignal with its own, which Node's fetch rejects; the
  // client's timeout signal is dropped in this environment only.
  const { api, session } = createAppServices(config, auth, { fetch: (request) => fetch(request) });
  if (persona) await session.signIn(persona);
  else await session.restore();
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(<App config={config} session={session} api={api} router={router} />);
  return router;
}

const mainNav = async () => within(await screen.findByRole('navigation', { name: 'Main' }));
const navLabels = async () => (await mainNav()).getAllByRole('link').map((l) => l.textContent);

describe('web app against the contract mocks', () => {
  it('sends signed-out users to sign-in and back to where they were going', async () => {
    const router = await renderApp('/clinics');
    await screen.findByRole('heading', { name: 'Sign in' });
    expect(router.state.location.pathname).toBe('/sign-in');

    await userEvent.click(
      screen.getByRole('button', { name: /Continue as Digital Success Manager/ }),
    );
    expect(await screen.findByRole('heading', { name: 'My Clinics', level: 1 })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/clinics');
    // The API scopes the list: Priya Shah's four assigned clinics.
    expect(await screen.findByRole('link', { name: 'Smile Dental Care' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Bright Smile Clinic' })).toBeNull();
  });

  it('gives a Platform Administrator the full navigation and all clinics', async () => {
    await renderApp('/clinics', 'platform-administrator');
    expect(await navLabels()).toEqual([
      'Dashboard',
      'Clinics',
      'Users',
      'Audit Reports',
      'Settings',
    ]);
    expect(await screen.findByRole('heading', { name: 'Clinics', level: 1 })).toBeTruthy();
    expect(await screen.findByText('Showing 1–10 of 12 clinics')).toBeTruthy();
    expect(screen.getByText('Rohan Agarwal')).toBeTruthy();
  });

  it('gives a Platform Administrator the platform overview dashboard', async () => {
    await renderApp('/dashboard', 'platform-administrator');
    await screen.findByText('Overview of clinics, progress and impact');
    const total = await screen.findByRole('region', { name: 'Total clinics' });
    expect(within(total).getByText('12')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Active clinics' })).toBeTruthy();
    const inactive = screen.getByRole('region', { name: 'Inactive clinics' });
    expect(within(inactive).getByText('2')).toBeTruthy();
    const legend = screen.getByRole('list', { name: 'Clinics by status' });
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Active4(29%)', 'Prospects4(29%)', 'In progress4(29%)', 'Inactive2(14%)']);
    // Feed and highlights come from the clinics list only.
    const feed = await screen.findByRole('list', { name: 'Recent activity' });
    expect(within(feed).getAllByRole('link').length).toBeGreaterThan(0);
    const highlights = await screen.findByRole('list', { name: 'Key highlights' });
    expect(within(highlights).getByText(/new prospects? added this month/)).toBeTruthy();
    expect(within(highlights).getByText(/% of prospects have a website/)).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Growth measure' })).toBeTruthy();
    // Digital Success Manager widgets are not part of this dashboard.
    expect(screen.queryByRole('region', { name: 'Assessments awaiting review' })).toBeNull();
    expect(screen.queryByText('Recent conversations')).toBeNull();
  });

  it('labels the list "My Clinics" for users who do not see all clinics', async () => {
    await renderApp('/dashboard', 'digital-success-manager');
    expect(await navLabels()).toEqual(['Dashboard', 'My Clinics', 'Audit Reports', 'Settings']);
    expect(screen.getByText('Digital Success Manager')).toBeTruthy();
  });

  it('sends a Clinic Administrator to the mobile app, never the internal portal', async () => {
    await renderApp(`/clinics/${SMILE}`, 'clinic-administrator');
    expect(await screen.findByText('Use the Radial Pulse mobile app')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull();
    expect(screen.queryByText('Smile Dental Care')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await screen.findByRole('heading', { name: 'Sign in' });
  });

  it('blocks Users without the users:read permission', async () => {
    await renderApp('/users', 'digital-success-manager');
    expect(await screen.findByText('You don’t have access to this page')).toBeTruthy();
  });

  it('shows the dashboard numbers for the caller’s clinics', async () => {
    const router = await renderApp('/', 'digital-success-manager');
    await screen.findByRole('heading', { name: 'Dashboard', level: 1 });
    expect(router.state.location.pathname).toBe('/dashboard');
    const total = await screen.findByRole('region', { name: 'Total clinics' });
    expect(await within(total).findByText('4')).toBeTruthy();
  });

  it('scopes the clinic workspace to the clinic in the URL', async () => {
    await renderApp(`/clinics/${SMILE}/chat`, 'digital-success-manager');
    expect(
      await screen.findByRole('heading', { name: 'Smile Dental Care', level: 1 }),
    ).toBeTruthy();
    const sections = within(screen.getByRole('navigation', { name: 'Clinic sections' }));
    expect(sections.getAllByRole('link').map((l) => l.firstChild?.textContent)).toEqual([
      'Overview',
      'Digital Information',
      'Unified Audit',
      'Social Media',
      'Chat',
    ]);
    expect(sections.getByRole('link', { name: /Chat/ }).getAttribute('aria-current')).toBe('page');
    expect(await screen.findByText(/Please use these for the website as well/)).toBeTruthy();
    // The sidebar keeps "My Clinics" active while inside a clinic.
    expect(
      (await mainNav()).getByRole('link', { name: 'My Clinics' }).getAttribute('aria-current'),
    ).toBe('true');
  });

  it('switching clinics re-scopes the workspace', async () => {
    const router = await renderApp(`/clinics/${SMILE}`, 'platform-administrator');
    expect(
      await screen.findByRole('heading', { name: 'Smile Dental Care', level: 1 }),
    ).toBeTruthy();
    await router.navigate({ to: '/clinics/$clinicId', params: { clinicId: BRIGHT } });
    expect(
      await screen.findByRole('heading', { name: 'Bright Smile Clinic', level: 1 }),
    ).toBeTruthy();
  });

  it('shows no sections for a clinic outside the caller’s access', async () => {
    await renderApp(`/clinics/${BRIGHT}`, 'digital-success-manager');
    expect(await screen.findByText('This clinic isn’t available')).toBeTruthy();
    const sections = within(screen.getByRole('navigation', { name: 'Clinic sections' }));
    expect(sections.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders the unified audit, never scoring unavailable components as 0', async () => {
    await renderApp(`/clinics/${SMILE}/audit`, 'digital-success-manager');
    const overall = await screen.findByRole('region', { name: 'Overall score' });
    expect(within(overall).getByText('62 out of 100')).toBeTruthy();
    const social = screen.getByRole('region', { name: 'Social Presence' });
    expect(within(social).getAllByText('Not Available').length).toBeGreaterThan(0);
    expect(within(social).queryByText('0 out of 100')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Opening hours differ between the website and Google' }),
    ).toBeTruthy();
  });

  it('sends a chat message', async () => {
    const user = userEvent.setup();
    await renderApp(`/clinics/${SMILE}/chat`, 'digital-success-manager');
    const box = await screen.findByRole('textbox', { name: 'Message' });
    await user.type(box, 'We fixed the Sunday hours on Google.{Enter}');
    expect(await screen.findByText('We fixed the Sunday hours on Google.')).toBeTruthy();
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
