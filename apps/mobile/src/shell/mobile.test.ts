import type { Schema } from '@radial-pulse/shared-types';
import { componentCaption } from './assessment-kit';
import { connectionSubtitle, offeredConnections } from './connection-row';
import { mockConnectBrowser } from './mock-connect-browser';
import { isTabVisible, TAB_SECTIONS } from './module-registry';

// The mobile app's API path (in-process contract mocks behind the client's
// fetch) is tested with the mocks in packages/api-client (mocks/in-process).

describe('tabs', () => {
  it('are Home, Insights, Social Media, Reports and Profile — chat is not a tab', () => {
    expect(TAB_SECTIONS.map((s) => s.label)).toEqual([
      'Home',
      'Insights',
      'Social Media',
      'Reports',
      'Profile',
    ]);
  });

  it('follow the selected clinic’s permissions', () => {
    const insights = TAB_SECTIONS.find((s) => s.id === 'insights')!;
    const profile = TAB_SECTIONS.find((s) => s.id === 'profile')!;
    expect(isTabVisible(insights, new Set(['clinics:read']))).toBe(false);
    expect(isTabVisible(insights, new Set(['assessments:read']))).toBe(true);
    expect(isTabVisible(profile, new Set())).toBe(true);
  });
});

const connection = (over: Partial<Schema<'ConnectionRead'>>): Schema<'ConnectionRead'> => ({
  platform: 'instagram',
  label: 'Instagram',
  available: true,
  status: 'not_connected',
  ...over,
});

describe('connected accounts', () => {
  it('offers platforms the API can connect, plus any already linked', () => {
    const rows = offeredConnections([
      connection({ platform: 'instagram' }),
      connection({ platform: 'x', label: 'X', available: false }),
      connection({ platform: 'linkedin', available: false, status: 'needs_reconnect' }),
    ]);
    expect(rows.map((r) => r.platform)).toEqual(['instagram', 'linkedin']);
  });

  it('describes a linked account by name and leaves the status to the badge', () => {
    expect(
      connectionSubtitle(connection({ status: 'connected', external_account_name: 'Smile' })),
    ).toBe('Smile');
    expect(connectionSubtitle(connection({}))).toBeNull();
    expect(connectionSubtitle(connection({ available: false }))).toBe('Not available yet');
  });

  it('mock Connect returns the API’s one-time state to the redirect address', async () => {
    const result = await mockConnectBrowser(
      'https://mock-oauth.radialpulse.example/youtube?state=abc123&redirect_uri=x',
      'radialpulse-local://connect/callback',
    );
    expect(result).toEqual({
      type: 'success',
      url: 'radialpulse-local://connect/callback?code=mock-code&state=abc123',
    });
    expect(await mockConnectBrowser('https://no-state.example', 'x://cb')).toEqual({
      type: 'cancel',
    });
  });
});

describe('component captions', () => {
  it('never show the backend status_reason code', () => {
    const caption = componentCaption({ status: 'not_available', summary: null });
    expect(caption).toBe('This part of your assessment isn’t available yet.');
    expect(caption).not.toContain('no_engine');
  });

  it('prefer the backend summary', () => {
    expect(componentCaption({ status: 'completed', summary: 'Good basics.' })).toBe('Good basics.');
  });
});
