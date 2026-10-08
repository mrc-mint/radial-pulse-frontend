import { describe, expect, it } from 'vitest';
import {
  buildProfileUpdate,
  feeToMajorString,
  formatClinicAddress,
  formatConsultationFee,
  formatWeeklyHoliday,
  parseMajorAmount,
  prepareProfileSave,
  profileErrorLabel,
  profileErrorsFromApi,
  profileToDraft,
  scheduleLines,
  validateProfileDraft,
  type PractitionerProfile,
} from './practitioner-profile';

const profile = (over: Partial<PractitionerProfile> = {}): PractitionerProfile => ({
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
    notes: null,
  },
  weekly_holiday: ['sun'],
  consultation_fee: { amount_minor: 50000, currency: 'INR' },
  services: [{ name: 'Braces', category: null, description: null }],
  patients_treated: 12000,
  professional_highlights: null,
  ...over,
});

describe('practitioner profile display', () => {
  it('formats the fee from minor units (50000 INR is ₹500.00)', () => {
    expect(formatConsultationFee({ amount_minor: 50000, currency: 'INR' })).toBe('₹500.00');
    expect(formatConsultationFee(null)).toBeNull();
  });

  it('lists every day: windows in time order, the holiday, or no consultation', () => {
    const lines = scheduleLines(profile().consultation_schedule, ['sun']);
    expect(lines[0]).toEqual({ day: 'mon', label: 'Monday', value: '09:30–13:00, 17:00–20:00' });
    expect(lines[1]!.value).toBe('No consultation');
    expect(lines[6]!.value).toBe('Weekly holiday');
  });

  it('formats the weekly holiday in week order and the structured address', () => {
    expect(formatWeeklyHoliday(['sun', 'mon'])).toBe('Monday, Sunday');
    expect(formatWeeklyHoliday([])).toBeNull();
    expect(formatClinicAddress(profile().clinic_address)).toBe(
      '12, Main Road, Kakinada, Andhra Pradesh, 533001',
    );
  });
});

describe('consultation fee amounts', () => {
  it('converts between rupees and paise without formatted strings', () => {
    expect(parseMajorAmount('500', 'INR')).toBe(50000);
    expect(parseMajorAmount('500.5', 'INR')).toBe(50050);
    expect(parseMajorAmount('1,500.25', 'INR')).toBe(150025);
    expect(parseMajorAmount('₹500', 'INR')).toBeNull();
    expect(parseMajorAmount('5.001', 'INR')).toBeNull();
    expect(feeToMajorString({ amount_minor: 50000, currency: 'INR' })).toBe('500');
    expect(feeToMajorString({ amount_minor: 50050, currency: 'INR' })).toBe('500.50');
  });
});

describe('profile draft', () => {
  it('loads every field of the existing profile', () => {
    const draft = profileToDraft(profile());
    expect(draft.full_name).toBe('Dr. Rahul Mehta');
    expect(draft.years_of_experience).toBe('14');
    expect(draft.clinic_operating_since).toBe('2008');
    expect(draft.address.city).toBe('Kakinada');
    expect(draft.days.mon).toEqual([
      { opens: '09:30', closes: '13:00' },
      { opens: '17:00', closes: '20:00' },
    ]);
    expect(draft.days.tue).toEqual([]);
    expect(draft.weekly_holiday).toEqual(['sun']);
    expect(draft.fee_amount).toBe('500');
    expect(draft.fee_currency).toBe('INR');
    expect(draft.services).toEqual([{ name: 'Braces', category: '', description: '' }]);
  });

  it('produces an empty update when nothing changed', () => {
    const p = profile();
    expect(buildProfileUpdate(p, profileToDraft(p))).toEqual({});
  });
});

describe('partial update payload', () => {
  it('sends only changed fields, with null for a cleared one', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.specialization = '  Endodontics ';
    draft.qualifications = '';
    draft.years_of_experience = '15';
    expect(buildProfileUpdate(p, draft)).toEqual({
      specialization: 'Endodontics',
      qualifications: null,
      years_of_experience: 15,
    });
  });

  it('sends the structured schedule with several windows per day, sorted', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.days.tue = [
      { opens: '16:00', closes: '19:00' },
      { opens: '10:00', closes: '12:00' },
    ];
    draft.schedule_notes = 'Closed on public holidays';
    expect(buildProfileUpdate(p, draft)).toEqual({
      consultation_schedule: {
        timezone: 'Asia/Kolkata',
        days: {
          mon: [
            { opens: '09:30', closes: '13:00' },
            { opens: '17:00', closes: '20:00' },
          ],
          tue: [
            { opens: '10:00', closes: '12:00' },
            { opens: '16:00', closes: '19:00' },
          ],
        },
        notes: 'Closed on public holidays',
      },
    });
  });

  it('clears the schedule when every window and the notes are removed', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.days.mon = [];
    expect(buildProfileUpdate(p, draft)).toEqual({ consultation_schedule: null });
  });

  it('sends the weekly holiday as day codes in week order', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.weekly_holiday = ['sun', 'sat'];
    expect(buildProfileUpdate(p, draft)).toEqual({ weekly_holiday: ['sat', 'sun'] });
    draft.weekly_holiday = [];
    expect(buildProfileUpdate(p, draft)).toEqual({ weekly_holiday: [] });
  });

  it('sends the fee as amount_minor and currency, never a formatted string', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.fee_amount = '750.50';
    expect(buildProfileUpdate(p, draft)).toEqual({
      consultation_fee: { amount_minor: 75050, currency: 'INR' },
    });
    draft.fee_amount = '';
    expect(buildProfileUpdate(p, draft)).toEqual({ consultation_fee: null });
  });

  it('sends the whole structured address when one part changed', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.address.city = 'Rajahmundry';
    draft.address.postal_code = '';
    expect(buildProfileUpdate(p, draft)).toEqual({
      clinic_address: {
        address_line: '12, Main Road',
        city: 'Rajahmundry',
        state: 'Andhra Pradesh',
        postal_code: null,
        country: 'IN',
      },
    });
  });

  it('sends services as ServiceItem objects and drops empty rows', () => {
    const p = profile();
    const draft = profileToDraft(p);
    draft.services.push({ name: 'Implants', category: 'Surgery', description: '' });
    draft.services.push({ name: '', category: '', description: '' });
    expect(buildProfileUpdate(p, draft)).toEqual({
      services: [
        { name: 'Braces', category: null, description: null },
        { name: 'Implants', category: 'Surgery', description: null },
      ],
    });
  });
});

describe('validation', () => {
  const errorsFor = (edit: (d: ReturnType<typeof profileToDraft>) => void) => {
    const p = profile();
    const draft = profileToDraft(p);
    edit(draft);
    return prepareProfileSave(p, draft, { currentYear: 2026 }).errors;
  };

  it('accepts the loaded profile', () => {
    expect(errorsFor(() => {})).toEqual({});
  });

  it('checks windows: format, order and overlap', () => {
    expect(
      errorsFor((d) => {
        d.days.tue = [
          { opens: '9:30', closes: '13:00' },
          { opens: '14:00', closes: '13:00' },
        ];
        d.days.wed = [
          { opens: '09:00', closes: '13:00' },
          { opens: '12:00', closes: '15:00' },
        ];
      }),
    ).toEqual({
      'consultation_schedule.days.tue.0': 'Use 24-hour times, e.g. 09:30.',
      'consultation_schedule.days.tue.1': 'Closing time must be after opening time.',
      'consultation_schedule.days.wed.1': 'This window overlaps another one on the same day.',
    });
  });

  it('rejects timings on a weekly holiday', () => {
    const errors = errorsFor((d) => {
      d.days.sun = [{ opens: '10:00', closes: '12:00' }];
    });
    expect(errors['consultation_schedule.days.sun']).toMatch(/weekly holiday/);
  });

  it('checks numbers, the fee, required names and service names', () => {
    expect(
      errorsFor((d) => {
        d.full_name = ' ';
        d.clinic_name = '';
        d.years_of_experience = '81';
        d.clinic_operating_since = '2030';
        d.patients_treated = '12.5';
        d.fee_amount = '₹500';
        d.services.push({ name: '', category: 'Cosmetic', description: '' });
      }),
    ).toEqual({
      full_name: 'Enter the practitioner’s full name.',
      clinic_name: 'Enter the clinic name.',
      years_of_experience: 'Enter a number from 0 to 80.',
      clinic_operating_since: 'Enter a number from 1800 to 2026.',
      patients_treated: 'Enter the number of patients as a whole number.',
      'consultation_fee.amount_minor': 'Enter an amount, e.g. 500 or 500.50.',
      'services.1.name': 'Enter the service name.',
    });
  });

  it('requires a full name only when the save would create the main practitioner', () => {
    const p = profile({ practitioner_id: null, full_name: null });
    const draft = profileToDraft(p);
    expect(prepareProfileSave(p, draft).errors).toEqual({});
    draft.years_of_experience = '10';
    expect(prepareProfileSave(p, draft).errors.full_name).toBeDefined();
    draft.clinic_name = 'Smile';
    draft.years_of_experience = '';
    expect(validateProfileDraft(draft)).toEqual({});
  });
});

describe('API errors', () => {
  it('maps 422 field paths onto the form keys and labels them', () => {
    const errors = profileErrorsFromApi({
      'practitioner_profile.consultation_schedule.days.mon': ['Windows must not overlap'],
      'practitioner_profile.consultation_fee.amount_minor': ['Too large', 'Second'],
      version: ['Input should be greater than or equal to 1'],
    });
    expect(errors).toEqual({
      'consultation_schedule.days.mon': 'Windows must not overlap',
      'consultation_fee.amount_minor': 'Too large',
      version: 'Input should be greater than or equal to 1',
    });
    expect(profileErrorLabel('consultation_schedule.days.mon.1')).toBe(
      'Consultation schedule, Monday, window 2',
    );
    expect(profileErrorLabel('services.0.name')).toBe('Services, item 1, name');
  });
});
