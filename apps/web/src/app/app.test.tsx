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
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from '@tanstack/react-router';
import { getResponse, http, HttpResponse, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
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
  vi.restoreAllMocks();
});
afterAll(() => server.close());

const SMILE = 'c1000000-0000-4000-8000-000000000001';
const BRIGHT = 'c1000000-0000-4000-8000-000000000002';

async function renderApp(
  path: string,
  persona?: PersonaId,
  /** Handlers that take precedence over the mocks (they receive the mocks to delegate to). */
  overrides?: (mocks: RequestHandler[]) => RequestHandler[],
) {
  const mocks = createMockHandlers({ baseUrl: config.apiBaseUrl, db: createMockDb() });
  server.use(...mocks);
  if (overrides) server.use(...overrides(mocks));
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
    expect(
      await screen.findByRole('heading', { name: 'My Client Portfolio', level: 1 }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe('/clinics');
    // The API scopes the list: Priya Shah's four assigned clinics.
    expect(await screen.findByRole('link', { name: 'Smile Dental Care' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Bright Smile Clinic' })).toBeNull();
  });

  it('gives a Platform Administrator the full navigation and all clinics', async () => {
    await renderApp('/clinics', 'platform-administrator');
    expect(await navLabels()).toEqual([
      'Dashboard',
      'Client Organizations',
      'Users',
      'Digital Presence Assessments',
      'Settings',
    ]);
    expect(
      await screen.findByRole('heading', { name: 'Client Organizations', level: 1 }),
    ).toBeTruthy();
    expect(await screen.findByText('Showing 1–10 of 12 client organizations')).toBeTruthy();
    expect(screen.getByText('Rohan Agarwal')).toBeTruthy();
  });

  it('lists clinics by status, with inactive (archived) clinics on their own tab', async () => {
    const user = userEvent.setup();
    await renderApp('/clinics', 'platform-administrator');
    const tabs = within(await screen.findByRole('tablist', { name: 'Filter by status' }));
    expect(tabs.getAllByRole('tab').map((t) => t.firstChild?.textContent)).toEqual([
      'All client organizations',
      'Active',
      'Prospective clients',
      'In progress',
      'Inactive',
    ]);
    expect(screen.queryByRole('columnheader', { name: 'Open work' })).toBeNull();
    // Contract stages are shown as their group, never as the raw stage.
    await screen.findByText('Showing 1–10 of 12 client organizations');
    expect(screen.queryByText('Profile enriched')).toBeNull();
    expect(screen.queryByText('Client discussion')).toBeNull();

    await user.click(tabs.getByRole('tab', { name: /Inactive/ }));
    expect(await screen.findByRole('link', { name: 'Lotus Dental Studio' })).toBeTruthy();
    expect(screen.getByText('Showing 1–2 of 2 client organizations')).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Status' }) as HTMLSelectElement).value).toBe(
      'inactive',
    );

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(await screen.findByText('Showing 1–10 of 12 client organizations')).toBeTruthy();
  });

  it('gives a Platform Administrator the platform overview dashboard', async () => {
    await renderApp('/dashboard', 'platform-administrator');
    await screen.findByText('Overview of client organizations, progress and impact');
    const total = await screen.findByRole('region', { name: 'Total client organizations' });
    expect(within(total).getByText('12')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Active clients' })).toBeTruthy();
    const inactive = screen.getByRole('region', { name: 'Inactive clients' });
    expect(within(inactive).getByText('2')).toBeTruthy();
    const legend = screen.getByRole('list', { name: 'Client organizations by status' });
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Active4(29%)', 'Prospective clients4(29%)', 'In progress4(29%)', 'Inactive2(14%)']);
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

  it('labels the list "My Client Portfolio" for users who do not see all clinics', async () => {
    await renderApp('/dashboard', 'digital-success-manager');
    expect(await navLabels()).toEqual([
      'Dashboard',
      'My Client Portfolio',
      'Digital Presence Assessments',
      'Settings',
    ]);
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
    await screen.findByRole('heading', {
      name: /^Good (morning|afternoon|evening), Priya!$/,
      level: 1,
    });
    expect(router.state.location.pathname).toBe('/dashboard');
    const total = await screen.findByRole('region', { name: 'My Client Portfolio' });
    expect(await within(total).findByText('4')).toBeTruthy();
    // Clinics with an assessment submitted for review are listed.
    const attention = await screen.findByRole('list', {
      name: 'Client organizations needing attention',
    });
    expect(
      (await within(attention).findAllByText(/Audit ready for review/)).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByRole('list', { name: 'Recent activity' })).toBeTruthy();
    expect(screen.getByText('Recent conversations')).toBeTruthy();
  });

  it('scopes the clinic workspace to the clinic in the URL', async () => {
    await renderApp(`/clinics/${SMILE}/chat`, 'digital-success-manager');
    expect(
      await screen.findByRole('heading', { name: 'Smile Dental Care', level: 2 }),
    ).toBeTruthy();
    const sections = within(
      screen.getByRole('navigation', { name: 'Client organization sections' }),
    );
    expect(sections.getAllByRole('link').map((l) => l.firstChild?.textContent)).toEqual([
      'Overview',
      'Digital Presence',
      'Social Presence Insights',
      'Listings',
      'Digital Presence Assessment',
      'Media',
      'Activity',
      'Client Collaboration',
    ]);
    expect(
      sections.getByRole('link', { name: /Client Collaboration/ }).getAttribute('aria-current'),
    ).toBe('page');
    expect(await screen.findByText(/Please use these for the website as well/)).toBeTruthy();
    // The sidebar keeps "My Client Portfolio" active while inside a clinic.
    expect(
      (await mainNav())
        .getByRole('link', { name: 'My Client Portfolio' })
        .getAttribute('aria-current'),
    ).toBe('true');
  });

  it('switching clinics re-scopes the workspace', async () => {
    const router = await renderApp(`/clinics/${SMILE}`, 'platform-administrator');
    expect(
      await screen.findByRole('heading', { name: 'Smile Dental Care', level: 2 }),
    ).toBeTruthy();
    // Platform Administrators have no clinic chat; the clinic's DSM chats.
    const sections = within(
      screen.getByRole('navigation', { name: 'Client organization sections' }),
    );
    expect(sections.queryByRole('link', { name: /Client Collaboration/ })).toBeNull();
    await router.navigate({ to: '/clinics/$clinicId', params: { clinicId: BRIGHT } });
    expect(
      await screen.findByRole('heading', { name: 'Bright Smile Clinic', level: 2 }),
    ).toBeTruthy();
  });

  it('shows clinic details: photo, main practitioner, status actions and activity', async () => {
    const user = userEvent.setup();
    await renderApp(`/clinics/${SMILE}`, 'platform-administrator');
    await screen.findByRole('heading', { name: 'Client organization details', level: 1 });
    expect(await screen.findByRole('img', { name: 'Photo of Smile Dental Care' })).toBeTruthy();
    expect((await screen.findAllByText('Dr. Rahul Mehta')).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /View on Google Maps/ })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Change portfolio allocation' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Archive client organization' }));
    await user.type(screen.getByRole('textbox', { name: /Reason/ }), 'Not interested right now');
    const dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Archive client organization' }));
    expect(await screen.findByText('Archived: Not interested right now')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Activity' }));
    expect(
      await screen.findByText('Client organization archived: Not interested right now'),
    ).toBeTruthy();
  });

  it.each(['digital-success-manager', 'platform-administrator'] as const)(
    'lets a %s review clinic media, with no upload or download controls',
    async (persona) => {
      const user = userEvent.setup();
      const container = document.body;
      await renderApp(`/clinics/${SMILE}/media`, persona);
      expect(await screen.findByRole('heading', { name: 'Practitioner photos' })).toBeTruthy();
      // Categories from the product reference.
      expect(screen.getByRole('heading', { name: 'Exterior & signage' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Logo & cover photo' })).toBeTruthy();
      expect(screen.getAllByText('90° L').length).toBeGreaterThan(0);
      expect(screen.getByRole('tab', { name: 'Without apron' })).toBeTruthy();

      // Staff never upload, replace, delete or download here.
      expect(container.querySelector('input[type="file"]')).toBeNull();
      expect(container.querySelector('a[download]')).toBeNull();
      expect(
        screen.queryByRole('button', { name: /^(upload|replace|delete|remove|download|save) /i }),
      ).toBeNull();

      const verified = /Verified\. Open to review/;
      const before = (await screen.findAllByRole('button', { name: verified })).length;
      const tile = (
        await screen.findAllByRole('button', { name: /Awaiting review\. Open to review/ })
      )[0]!;
      await user.click(tile);
      const dialog = within(await screen.findByRole('dialog'));
      // A retake needs a note; approving does not.
      expect(
        (dialog.getByRole('button', { name: 'Request retake' }) as HTMLButtonElement).disabled,
      ).toBe(true);
      await user.click(dialog.getByRole('button', { name: 'Approve' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: verified })).toHaveLength(before + 1),
      );
      // Protected media never appears as a link.
      expect([...container.querySelectorAll('a')].some((a) => /mock-storage/.test(a.href))).toBe(
        false,
      );
    },
  );

  it('shows no sections for a clinic outside the caller’s access', async () => {
    await renderApp(`/clinics/${BRIGHT}`, 'digital-success-manager');
    expect(await screen.findByText('This client organization isn’t available')).toBeTruthy();
    const sections = within(
      screen.getByRole('navigation', { name: 'Client organization sections' }),
    );
    expect(sections.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders the Digital Presence Assessment, never scoring unavailable components as 0', async () => {
    await renderApp(`/clinics/${SMILE}/assessment`, 'digital-success-manager');
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

describe('Practitioner Profile (web, staff)', () => {
  const api = `${config.apiBaseUrl}/api/v1`;
  const profileUrl = `${api}/clinics/${SMILE}/profile`;
  const EDIT = { name: 'Edit Practitioner Profile' };

  /** The signed-in user's clinic permissions without `profile:write`. */
  const withoutProfileWrite = (mocks: RequestHandler[]) => [
    http.get(`${api}/auth/me`, async ({ request }) => {
      const me = (await (await getResponse(mocks, request))!.json()) as {
        clinics: Array<{ permissions: string[] }>;
      };
      for (const c of me.clinics) {
        c.permissions = c.permissions.filter((p) => p !== 'profile:write');
      }
      return HttpResponse.json(me);
    }),
  ];

  /** Records PUT /profile bodies, then lets the mocks answer. */
  const recordPuts = (bodies: unknown[]) => (mocks: RequestHandler[]) => [
    http.put(profileUrl, async ({ request }) => {
      bodies.push(await request.clone().json());
      return (await getResponse(mocks, request))!;
    }),
  ];

  it('shows the profile with its structured schedule, fee, address and services', async () => {
    await renderApp(`/clinics/${SMILE}`, 'digital-success-manager');
    await screen.findByRole('heading', { name: 'Practitioner Profile' });
    for (const text of [
      'Client organization information',
      'Consultation schedule',
      '09:30–13:00, 17:00–20:00',
      '₹500.00',
      'Braces',
      'Professional highlights',
      'Invisalign-certified provider. Speaker at the Indian Dental Conference 2024.',
    ]) {
      expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('Weekly holiday').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Doctor/)).toBeNull();
    expect(screen.getByRole('button', EDIT)).toBeTruthy();
  });

  it('is read-only without profile:write', async () => {
    await renderApp(`/clinics/${SMILE}`, 'digital-success-manager', withoutProfileWrite);
    expect((await screen.findAllByText('09:30–13:00, 17:00–20:00')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', EDIT)).toBeNull();
  });

  it('validates, then saves only changed fields with the version read', async () => {
    const user = userEvent.setup();
    const bodies: unknown[] = [];
    await renderApp(`/clinics/${SMILE}`, 'digital-success-manager', recordPuts(bodies));
    await user.click(await screen.findByRole('button', EDIT));
    const form = within(await screen.findByRole('dialog'));

    const fee = form.getByRole('textbox', { name: /Consultation fee/ });
    await user.clear(fee);
    await user.type(fee, '750.50');
    await user.click(form.getByRole('checkbox', { name: 'Saturday weekly holiday' }));
    // Saturday still has a window: the form asks to resolve that before saving.
    await user.click(form.getByRole('button', { name: 'Save changes' }));
    expect(form.getAllByText(/Saturday is a weekly holiday/).length).toBeGreaterThan(0);
    expect(bodies).toHaveLength(0);
    await user.click(form.getByRole('button', { name: 'Remove Saturday window 1' }));
    await user.click(form.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(bodies).toEqual([
      {
        version: 1,
        practitioner_profile: {
          consultation_schedule: expect.objectContaining({
            timezone: 'Asia/Kolkata',
            days: expect.not.objectContaining({ sat: expect.anything() }),
          }),
          weekly_holiday: ['sat', 'sun'],
          consultation_fee: { amount_minor: 75050, currency: 'INR' },
        },
      },
    ]);
    const days = (
      bodies[0] as { practitioner_profile: { consultation_schedule: { days: object } } }
    ).practitioner_profile.consultation_schedule.days;
    expect(Object.keys(days)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri']);
    expect(await screen.findByText('₹750.50')).toBeTruthy();
  });

  it('shows API validation errors on the field', async () => {
    const user = userEvent.setup();
    await renderApp(`/clinics/${SMILE}`, 'digital-success-manager', () => [
      http.put(profileUrl, () =>
        HttpResponse.json(
          {
            type: 'validation_error',
            title: 'Invalid input',
            status: 422,
            errors: [
              {
                loc: ['body', 'practitioner_profile', 'specialization'],
                msg: 'Unknown specialization',
                type: 'value_error',
              },
            ],
          },
          { status: 422, headers: { 'content-type': 'application/problem+json' } },
        ),
      ),
    ]);
    await user.click(await screen.findByRole('button', EDIT));
    const form = within(await screen.findByRole('dialog'));
    const specialization = form.getByRole('textbox', { name: 'Specialization' });
    await user.clear(specialization);
    await user.type(specialization, 'Dentistry');
    await user.click(form.getByRole('button', { name: 'Save changes' }));
    // On the field and in the summary.
    expect(await form.findAllByText(/Unknown specialization/)).toHaveLength(2);
    expect(specialization.getAttribute('aria-invalid')).toBe('true');
  });

  it('warns before reloading after a version conflict', async () => {
    const user = userEvent.setup();
    // Someone else saves first, so this save gets the API's 409.
    await renderApp(`/clinics/${SMILE}`, 'digital-success-manager', (mocks) => [
      http.put(
        profileUrl,
        async ({ request }) => {
          const { version } = (await request.clone().json()) as { version: number };
          const other = new Request(request.url, {
            method: 'PUT',
            headers: request.headers,
            body: JSON.stringify({ version, practitioner_profile: { patients_treated: 99999 } }),
          });
          await getResponse(mocks, other);
          return (await getResponse(mocks, request))!;
        },
        { once: true },
      ),
    ]);
    await user.click(await screen.findByRole('button', EDIT));
    const form = within(await screen.findByRole('dialog'));
    const years = () =>
      form.getByRole('textbox', { name: 'Total years of medical experience' }) as HTMLInputElement;
    await user.clear(years());
    await user.type(years(), '30');
    await user.click(form.getByRole('button', { name: 'Save changes' }));
    expect(await form.findByText(/Someone else saved this Practitioner Profile/)).toBeTruthy();

    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await user.click(form.getByRole('button', { name: 'Reload latest profile' }));
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/unsaved changes .* discarded/));
    expect(years().value).toBe('30');

    confirm.mockReturnValueOnce(true);
    await user.click(form.getByRole('button', { name: 'Reload latest profile' }));
    await waitFor(() =>
      expect(
        (form.getByRole('textbox', { name: 'Approximate patients treated' }) as HTMLInputElement)
          .value,
      ).toBe('99999'),
    );
    expect(years().value).not.toBe('30');
    expect(form.queryByText(/Someone else saved/)).toBeNull();
  });
});
