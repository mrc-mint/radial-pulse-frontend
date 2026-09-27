// @vitest-environment jsdom
import type { Permission } from '@radial-pulse/shared-types';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveClinicSections, resolveNavigation, type ModuleManifest } from '../core';
import {
  AccessDenied,
  ClinicWorkspace,
  RequireCapability,
  WebAppShell,
  type RenderLink,
} from './index';

afterEach(cleanup);

const modules: ModuleManifest[] = [
  {
    id: 'dashboard',
    navEntries: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'dashboard',
        placement: 'primary',
        order: 10,
      },
    ],
  },
  {
    id: 'clinics',
    navEntries: [
      {
        id: 'clinics',
        label: 'Clinics',
        scopedLabel: 'My Clinics',
        to: '/clinics',
        icon: 'clinics',
        placement: 'primary',
        order: 20,
      },
    ],
    clinicSections: [{ id: 'overview', label: 'Overview', path: '', order: 10 }],
  },
  {
    id: 'users',
    navEntries: [
      {
        id: 'users',
        label: 'Users',
        to: '/users',
        icon: 'users',
        requiredCapability: 'users:read',
        placement: 'primary',
        order: 30,
      },
    ],
  },
  {
    id: 'assessments',
    navEntries: [
      {
        id: 'audit-reports',
        label: 'Audit Reports',
        to: '/audit-reports',
        icon: 'reports',
        placement: 'primary',
        order: 40,
      },
    ],
    clinicSections: [{ id: 'audit', label: 'Unified Audit', path: 'audit', order: 30 }],
  },
  { id: 'chat', clinicSections: [{ id: 'chat', label: 'Chat', path: 'chat', order: 50 }] },
  {
    id: 'settings',
    navEntries: [
      {
        id: 'settings',
        label: 'Settings',
        to: '/settings',
        icon: 'settings',
        placement: 'primary',
        order: 90,
      },
    ],
  },
];

const renderLink: RenderLink = ({ to, children, onClick, ...rest }) => (
  <a
    href={to}
    {...rest}
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
  >
    {children}
  </a>
);

function renderShell({
  capabilities = ['users:read'] as Permission[],
  allClinics = true,
  pathname = '/dashboard',
  onSignOut = vi.fn(),
  environmentLabel = 'Local' as string | null,
} = {}) {
  const nav = resolveNavigation(modules, new Set(capabilities), { allClinics });
  const props = {
    nav,
    renderLink,
    user: { name: 'Rohan Agarwal', roleLabel: 'Platform Administrator' },
    onSignOut,
    environmentLabel,
  };
  const view = render(
    <WebAppShell {...props} pathname={pathname}>
      <h1>Page content</h1>
    </WebAppShell>,
  );
  return {
    ...view,
    onSignOut,
    navigate: (next: string) =>
      view.rerender(
        <WebAppShell {...props} pathname={next}>
          <h1>Page content</h1>
        </WebAppShell>,
      ),
  };
}

const mainNavLabels = () =>
  within(screen.getByRole('navigation', { name: 'Main' }))
    .getAllByRole('link')
    .map((a) => a.textContent);

describe('WebAppShell', () => {
  it('renders landmarks, a skip link and the content', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('main').id).toBe('rp-main');
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe(
      '#rp-main',
    );
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeTruthy();
  });

  it('shows the Platform Administrator navigation', () => {
    renderShell({ capabilities: ['users:read'], allClinics: true });
    expect(mainNavLabels()).toEqual(['Dashboard', 'Clinics', 'Users', 'Audit Reports', 'Settings']);
  });

  it('shows the Digital Success Manager navigation', () => {
    renderShell({ capabilities: ['clinics:create'], allClinics: false });
    expect(mainNavLabels()).toEqual(['Dashboard', 'My Clinics', 'Audit Reports', 'Settings']);
  });

  it('marks the current page, and its section inside clinic routes', () => {
    const { navigate } = renderShell({ pathname: '/dashboard' });
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('link', { name: 'Clinics' }).getAttribute('aria-current')).toBeNull();

    navigate('/clinics/c_smile/chat');
    expect(screen.getByRole('link', { name: 'Clinics' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBeNull();
  });

  it('shows the user and signs out', async () => {
    const { onSignOut } = renderShell();
    expect(screen.getByText('Rohan Agarwal')).toBeTruthy();
    expect(screen.getByText('Platform Administrator')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('labels non-production environments only', () => {
    renderShell({ environmentLabel: 'Dev' });
    expect(screen.getByText('Dev')).toBeTruthy();
    cleanup();
    renderShell({ environmentLabel: null });
    expect(screen.queryByText('Dev')).toBeNull();
  });

  describe('small-screen drawer', () => {
    it('opens as a modal, makes the page inert and closes on Escape', async () => {
      const user = userEvent.setup();
      const { container } = renderShell();
      const toggle = screen.getByRole('button', { name: 'Open menu' });
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      const drawer = screen.getByRole('dialog', { name: 'Sidebar' });
      expect(drawer.getAttribute('aria-modal')).toBe('true');
      expect(toggle.getAttribute('aria-controls')).toBe(drawer.id);
      expect(container.querySelector('.rp-shell__body')?.hasAttribute('inert')).toBe(true);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close menu' }));

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(toggle);
    });

    it('closes when a destination is chosen', async () => {
      const user = userEvent.setup();
      const { navigate } = renderShell();
      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('link', { name: 'Audit Reports' }));
      expect(screen.queryByRole('dialog')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      navigate('/settings');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes from the close button', async () => {
      const user = userEvent.setup();
      renderShell();
      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('button', { name: 'Close menu' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

describe('ClinicWorkspace', () => {
  function renderWorkspace(pathname: string) {
    const sections = resolveClinicSections(modules, 'unrestricted', 'c_smile');
    render(
      <ClinicWorkspace
        sections={sections}
        pathname={pathname}
        renderLink={renderLink}
        header={<h1>Smile Dental Care</h1>}
      >
        <p>Section content</p>
      </ClinicWorkspace>,
    );
    return within(screen.getByRole('navigation', { name: 'Clinic sections' }));
  }

  it('lists clinic sections as clinic-scoped links', () => {
    const nav = renderWorkspace('/clinics/c_smile');
    expect(nav.getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Overview', '/clinics/c_smile'],
      ['Unified Audit', '/clinics/c_smile/audit'],
      ['Chat', '/clinics/c_smile/chat'],
    ]);
  });

  it('activates the overview only on the clinic root', () => {
    const nav = renderWorkspace('/clinics/c_smile/audit/a_9');
    expect(nav.getByRole('link', { name: 'Overview' }).getAttribute('aria-current')).toBeNull();
    expect(nav.getByRole('link', { name: 'Unified Audit' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });
});

describe('RequireCapability', () => {
  it('shows access denied without a session capability', async () => {
    const { SessionProvider, createSessionController, sessionFromMe } = await import('../core');
    const controller = createSessionController({
      restore: async () =>
        sessionFromMe({
          id: 'u-2',
          email: 'priya.shah@radialpulse.example',
          full_name: 'Priya Shah',
          platform_role: 'digital_success_manager',
          permissions: ['clinics:create'],
          all_clinics: false,
          sign_in_method: 'google',
          clinics: [],
        }),
      signIn: async () => null,
      signOut: async () => {},
      getAccessToken: async () => null,
    });
    await controller.restore();
    render(
      <SessionProvider controller={controller}>
        <RequireCapability capability="users:read">
          <p>User management</p>
        </RequireCapability>
      </SessionProvider>,
    );
    expect(screen.queryByText('User management')).toBeNull();
    expect(screen.getByText('You don’t have access to this page')).toBeTruthy();
    expect(AccessDenied).toBeTypeOf('function');
  });
});
