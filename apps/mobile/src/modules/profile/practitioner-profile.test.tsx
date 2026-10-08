// Test-only, runs in Node: the app has no React Native test renderer, so the
// screen is rendered to static markup (see `render` below). Never ships.
// eslint-disable-next-line no-restricted-imports
import { renderToStaticMarkup } from 'react-dom/server';
import { PractitionerProfileScreen } from './practitioner-profile-screen';

// The screen's API and session hooks are replaced; the form logic it uses
// (draft, validation, partial update) is tested in @radial-pulse/utils and the
// PUT itself against the contract mocks in @radial-pulse/api-client.

const mockAccess = { canWrite: true };
const mockQuery: { isLoading: boolean; error: unknown; data: unknown } = {
  isLoading: false,
  error: null,
  data: null,
};

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));
jest.mock('@radial-pulse/platform-shell/native', () => ({
  Screen: ({ children }: { children: unknown }) => children,
}));
jest.mock('@radial-pulse/platform-shell/core', () => ({
  useClinicId: () => 'c1000000-0000-4000-8000-000000000001',
  useClinicCan: (_clinicId: string, permission: string) =>
    permission === 'profile:write' ? mockAccess.canWrite : true,
}));
jest.mock('@radial-pulse/api-client/react', () => ({
  useClinicProfile: () => ({ ...mockQuery, isRefetching: false, refetch: jest.fn() }),
  useUpdateClinicProfile: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

const PROFILE = {
  clinic_id: 'c1000000-0000-4000-8000-000000000001',
  version: 3,
  practitioner_profile: {
    practitioner_id: 'b2000000-0000-4000-8000-000000000001',
    full_name: 'Dr. Rahul Mehta',
    specialization: 'Orthodontics',
    qualifications: 'BDS, MDS',
    years_of_experience: 14,
    clinic_name: 'Smile Dental Care',
    clinic_operating_since: 2008,
    clinic_address: {
      address_line: '12, Main Road',
      city: 'Kakinada',
      state: 'Andhra Pradesh',
      postal_code: '533001',
      country: 'IN',
    },
    consultation_schedule: {
      timezone: 'Asia/Kolkata',
      days: {
        mon: [
          { opens: '17:00', closes: '20:00' },
          { opens: '09:30', closes: '13:00' },
        ],
      },
      notes: 'By appointment on public holidays.',
    },
    weekly_holiday: ['sun'],
    consultation_fee: { amount_minor: 50000, currency: 'INR' },
    services: [{ name: 'Braces', category: 'Orthodontics', description: null }],
    patients_treated: 12000,
    professional_highlights: 'Invisalign-certified provider.',
  },
};

/**
 * Static markup of the screen. The app has no React Native renderer for
 * tests, so react-dom/server renders jest-expo's host components (`View`,
 * `Text`) as tags; its DOM-attribute warnings about them are expected.
 */
function render() {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    return renderToStaticMarkup(<PractitionerProfileScreen />);
  } finally {
    error.mockRestore();
  }
}

describe('Practitioner Profile screen', () => {
  beforeEach(() => {
    mockAccess.canWrite = true;
    Object.assign(mockQuery, { isLoading: false, error: null, data: PROFILE });
  });

  it('shows the loaded profile in its four sections', () => {
    const html = render();
    for (const text of [
      'Practitioner information',
      'Clinic information',
      'Consultation information',
      'Practice information',
      'Dr. Rahul Mehta',
      'Orthodontics',
      'BDS, MDS',
      'Smile Dental Care',
      '2008',
      '12, Main Road, Kakinada, Andhra Pradesh, 533001',
      // Several windows on one day, in time order.
      '09:30–13:00, 17:00–20:00',
      'Asia/Kolkata',
      'By appointment on public holidays.',
      'Weekly holiday',
      '₹500.00',
      'Braces (Orthodontics)',
      '12,000',
      'Invisalign-certified provider.',
    ]) {
      expect(html).toContain(text);
    }
    expect(html).not.toContain('Doctor');
  });

  it('offers editing to a Clinic Administrator (profile:write)', () => {
    expect(render()).toContain('Edit Practitioner Profile');
  });

  it('is read-only without profile:write (Clinic Team Member)', () => {
    mockAccess.canWrite = false;
    const html = render();
    expect(html).toContain('Dr. Rahul Mehta');
    expect(html).not.toContain('Edit Practitioner Profile');
    expect(html).not.toContain('Save changes');
  });

  it('shows a loading state, then the API error with its request id', () => {
    Object.assign(mockQuery, { isLoading: true, data: undefined });
    expect(render()).not.toContain('Practitioner information');

    Object.assign(mockQuery, {
      isLoading: false,
      data: undefined,
      error: {
        kind: 'server',
        status: 500,
        message: 'Something went wrong on our side.',
        requestId: 'req-123',
      },
    });
    const html = render();
    expect(html).toContain('Something went wrong on our side.');
    expect(html).toContain('req-123');
  });
});
