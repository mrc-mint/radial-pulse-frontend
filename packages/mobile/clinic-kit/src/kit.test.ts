import type { Schema } from '@radial-pulse/shared-types';
import { componentCaption } from './assessment-kit';
import { connectionSubtitle, offeredConnections } from './connection-row';

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
