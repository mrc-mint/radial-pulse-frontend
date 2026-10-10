import type { Schema } from '@radial-pulse/shared-types';

/**
 * Practitioner Profile (`ClinicProfileRead.practitioner_profile`): the form
 * model both apps edit, its validation, and the partial update it produces for
 * `PUT /clinics/{clinic_id}/profile`. Structured fields stay structured:
 * the schedule is per-day windows, the fee is `amount_minor` + `currency`, the
 * address and services keep their contract shapes.
 */

export type PractitionerProfile = Schema<'PractitionerProfileRead'>;
export type PractitionerProfileUpdate = Schema<'PractitionerProfileUpdate'>;
type Schedule = Schema<'ConsultationSchedule'>;
type Fee = Schema<'ConsultationFee'>;
type Address = Schema<'ClinicAddress'>;
type Service = Schema<'ServiceItem'>;

/** Contract day codes (`^(mon|tue|wed|thu|fri|sat|sun)$`), Monday first. */
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const WEEKDAY_SHORT_LABELS: Readonly<Record<Weekday, string>> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

/** Contract limits (`PractitionerProfileUpdate` and the schemas it references). */
export const PROFILE_LIMITS = {
  fullName: 200,
  specialization: 120,
  qualifications: 300,
  yearsOfExperience: 80,
  clinicName: 200,
  operatingSinceMin: 1800,
  addressLine: 300,
  city: 100,
  state: 100,
  postalCode: 20,
  timezone: 64,
  scheduleNotes: 500,
  windowsPerDay: 6,
  feeMinorMax: 1_000_000_000,
  services: 200,
  serviceName: 120,
  serviceCategory: 80,
  serviceDescription: 1000,
  patientsTreated: 1_000_000_000,
  highlights: 5000,
} as const;

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_COUNTRY = 'IN';

export interface WindowDraft {
  opens: string;
  closes: string;
}

export interface ServiceDraft {
  name: string;
  category: string;
  description: string;
}

/** Everything as the user types it: strings, so a half-typed number is not lost. */
export interface PractitionerProfileDraft {
  full_name: string;
  specialization: string;
  qualifications: string;
  years_of_experience: string;
  clinic_name: string;
  clinic_operating_since: string;
  address: {
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  timezone: string;
  schedule_notes: string;
  days: Record<Weekday, WindowDraft[]>;
  weekly_holiday: Weekday[];
  /** In major units (rupees for INR), e.g. "500" or "500.50". */
  fee_amount: string;
  fee_currency: string;
  services: ServiceDraft[];
  patients_treated: string;
  professional_highlights: string;
}

/** Field errors keyed by the contract field path inside `practitioner_profile` (e.g. `consultation_schedule.days.mon.1`). */
export type ProfileErrors = Record<string, string>;

const text = (value: string | null | undefined) => value ?? '';
const num = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/** Digits after the decimal point in a currency's minor unit (paise: 2). */
export function currencyMinorDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat('en-IN', { style: 'currency', currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/** `{amount_minor: 50000, currency: 'INR'}` → "500"; keeps paise when present ("500.50"). */
export function feeToMajorString(fee: Fee): string {
  const digits = currencyMinorDigits(fee.currency ?? DEFAULT_CURRENCY);
  const factor = 10 ** digits;
  const major = fee.amount_minor / factor;
  return fee.amount_minor % factor === 0 ? String(major) : major.toFixed(digits);
}

/** "500" / "500.5" / "1,500.00" → minor units; null when it is not an amount. */
export function parseMajorAmount(input: string, currency: string): number | null {
  const digits = currencyMinorDigits(currency);
  const cleaned = input.replace(/,/g, '').trim();
  const pattern = digits === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${digits}})?$`);
  if (!pattern.test(cleaned)) return null;
  const [whole, fraction = ''] = cleaned.split('.');
  return Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, '0') || '0');
}

/** "₹500.00" for display only — never sent to the API. */
export function formatConsultationFee(fee: Fee | null | undefined): string | null {
  if (!fee) return null;
  const currency = fee.currency ?? DEFAULT_CURRENCY;
  const digits = currencyMinorDigits(currency);
  const amount = fee.amount_minor / 10 ** digits;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(digits)}`;
  }
}

/** Windows of a day from the contract's `days` map, sorted by `opens`. */
export function dayWindows(schedule: Schedule | null | undefined, day: Weekday) {
  return [...(schedule?.days?.[day] ?? [])].sort((a, b) => a.opens.localeCompare(b.opens));
}

/** One line per day for display: "09:30–13:00, 17:00–20:00", "Weekly holiday" or "No consultation". */
export function scheduleLines(
  schedule: Schedule | null | undefined,
  weeklyHoliday: ReadonlyArray<string>,
): Array<{ day: Weekday; label: string; value: string }> {
  return WEEKDAYS.map((day) => {
    const windows = dayWindows(schedule, day);
    const value =
      windows.length > 0
        ? windows.map((w) => `${w.opens}–${w.closes}`).join(', ')
        : weeklyHoliday.includes(day)
          ? 'Weekly holiday'
          : 'No consultation';
    return { day, label: WEEKDAY_LABELS[day], value };
  });
}

/** "Sunday, Monday" in week order. */
export function formatWeeklyHoliday(days: ReadonlyArray<string>): string | null {
  const labels = WEEKDAYS.filter((d) => days.includes(d)).map((d) => WEEKDAY_LABELS[d]);
  return labels.length > 0 ? labels.join(', ') : null;
}

/** One-line address from the structured fields (display only). */
export function formatClinicAddress(address: Address | null | undefined): string | null {
  if (!address) return null;
  const line = [address.address_line, address.city, address.state, address.postal_code]
    .filter(Boolean)
    .join(', ');
  return line || null;
}

export function profileToDraft(profile: PractitionerProfile): PractitionerProfileDraft {
  const schedule = profile.consultation_schedule;
  const fee = profile.consultation_fee;
  return {
    full_name: text(profile.full_name),
    specialization: text(profile.specialization),
    qualifications: text(profile.qualifications),
    years_of_experience: num(profile.years_of_experience),
    clinic_name: profile.clinic_name,
    clinic_operating_since: num(profile.clinic_operating_since),
    address: {
      address_line: text(profile.clinic_address.address_line),
      city: text(profile.clinic_address.city),
      state: text(profile.clinic_address.state),
      postal_code: text(profile.clinic_address.postal_code),
      country: profile.clinic_address.country ?? DEFAULT_COUNTRY,
    },
    timezone: schedule?.timezone ?? DEFAULT_TIMEZONE,
    schedule_notes: text(schedule?.notes),
    days: Object.fromEntries(
      WEEKDAYS.map((day) => [day, dayWindows(schedule, day).map((w) => ({ ...w }))]),
    ) as Record<Weekday, WindowDraft[]>,
    weekly_holiday: WEEKDAYS.filter((d) => profile.weekly_holiday.includes(d)),
    fee_amount: fee ? feeToMajorString(fee) : '',
    fee_currency: fee?.currency ?? DEFAULT_CURRENCY,
    services: profile.services.map((s) => ({
      name: s.name,
      category: text(s.category),
      description: text(s.description),
    })),
    patients_treated: num(profile.patients_treated),
    professional_highlights: text(profile.professional_highlights),
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const optional = (value: string) => (value.trim() === '' ? null : value.trim());

/**
 * Checks a draft against the contract limits, plus three rules the form adds:
 * a window must close after it opens, a weekly holiday has no windows, and
 * the year the clinic opened is not in the future. Empty result = valid.
 */
export function validateProfileDraft(
  draft: PractitionerProfileDraft,
  options: { currentYear?: number; requireFullName?: boolean } = {},
): ProfileErrors {
  const errors: ProfileErrors = {};
  const L = PROFILE_LIMITS;
  const currentYear = options.currentYear ?? new Date().getFullYear();
  const maxLength = (key: string, value: string, max: number) => {
    if (value.trim().length > max) errors[key] = `Use at most ${max} characters.`;
  };
  const integer = (key: string, value: string, min: number, max: number, label: string) => {
    const v = value.trim();
    if (v === '') return;
    if (!/^\d+$/.test(v)) errors[key] = `Enter ${label} as a whole number.`;
    else if (Number(v) < min || Number(v) > max)
      errors[key] = `Enter a number from ${min} to ${max}.`;
  };

  if (draft.full_name.trim() === '' && options.requireFullName) {
    errors.full_name = 'Enter the practitioner’s full name.';
  }
  maxLength('full_name', draft.full_name, L.fullName);
  maxLength('specialization', draft.specialization, L.specialization);
  maxLength('qualifications', draft.qualifications, L.qualifications);
  integer('years_of_experience', draft.years_of_experience, 0, L.yearsOfExperience, 'years');

  if (draft.clinic_name.trim() === '') errors.clinic_name = 'Enter the clinic name.';
  maxLength('clinic_name', draft.clinic_name, L.clinicName);
  integer(
    'clinic_operating_since',
    draft.clinic_operating_since,
    L.operatingSinceMin,
    currentYear,
    'a year',
  );

  maxLength('clinic_address.address_line', draft.address.address_line, L.addressLine);
  maxLength('clinic_address.city', draft.address.city, L.city);
  maxLength('clinic_address.state', draft.address.state, L.state);
  maxLength('clinic_address.postal_code', draft.address.postal_code, L.postalCode);
  if (!/^[A-Za-z]{2}$/.test(draft.address.country.trim())) {
    errors['clinic_address.country'] = 'Use a two-letter country code, e.g. IN.';
  }

  if (draft.timezone.trim() === '') errors['consultation_schedule.timezone'] = 'Enter a time zone.';
  maxLength('consultation_schedule.timezone', draft.timezone, L.timezone);
  maxLength('consultation_schedule.notes', draft.schedule_notes, L.scheduleNotes);
  for (const day of WEEKDAYS) {
    const windows = draft.days[day];
    const key = `consultation_schedule.days.${day}`;
    if (windows.length > L.windowsPerDay) {
      errors[key] = `Add at most ${L.windowsPerDay} windows per day.`;
    }
    if (windows.length > 0 && draft.weekly_holiday.includes(day)) {
      errors[key] =
        `${WEEKDAY_LABELS[day]} is a weekly holiday. Remove its timings or the holiday.`;
    }
    windows.forEach((w, i) => {
      if (!TIME.test(w.opens) || !TIME.test(w.closes)) {
        errors[`${key}.${i}`] = 'Use 24-hour times, e.g. 09:30.';
      } else if (w.closes <= w.opens) {
        errors[`${key}.${i}`] = 'Closing time must be after opening time.';
      }
    });
    const valid = windows
      .map((w, i) => ({ ...w, i }))
      .filter((w) => !errors[`${key}.${w.i}`])
      .sort((a, b) => a.opens.localeCompare(b.opens));
    for (let i = 1; i < valid.length; i += 1) {
      if (valid[i]!.opens < valid[i - 1]!.closes) {
        errors[`${key}.${valid[i]!.i}`] = 'This window overlaps another one on the same day.';
      }
    }
  }

  const currency = draft.fee_currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    errors['consultation_fee.currency'] = 'Use a three-letter currency code, e.g. INR.';
  } else if (draft.fee_amount.trim() !== '') {
    const minor = parseMajorAmount(draft.fee_amount, currency);
    if (minor === null) {
      errors['consultation_fee.amount_minor'] = 'Enter an amount, e.g. 500 or 500.50.';
    } else if (minor > L.feeMinorMax) {
      errors['consultation_fee.amount_minor'] = 'This amount is too large.';
    }
  }

  const services = draft.services.filter(isFilledService);
  if (services.length > L.services) errors.services = `Add at most ${L.services} services.`;
  draft.services.forEach((s, i) => {
    if (!isFilledService(s)) return;
    if (s.name.trim() === '') errors[`services.${i}.name`] = 'Enter the service name.';
    maxLength(`services.${i}.name`, s.name, L.serviceName);
    maxLength(`services.${i}.category`, s.category, L.serviceCategory);
    maxLength(`services.${i}.description`, s.description, L.serviceDescription);
  });

  integer(
    'patients_treated',
    draft.patients_treated,
    0,
    L.patientsTreated,
    'the number of patients',
  );
  maxLength('professional_highlights', draft.professional_highlights, L.highlights);
  return errors;
}

const isFilledService = (s: ServiceDraft) =>
  s.name.trim() !== '' || s.category.trim() !== '' || s.description.trim() !== '';

/** The schedule a draft describes; null when it has no windows and no notes. */
function draftSchedule(draft: PractitionerProfileDraft): Schedule | null {
  const days: Record<string, Array<{ opens: string; closes: string }>> = {};
  for (const day of WEEKDAYS) {
    const windows = draft.days[day]
      .map((w) => ({ opens: w.opens.trim(), closes: w.closes.trim() }))
      .sort((a, b) => a.opens.localeCompare(b.opens));
    if (windows.length > 0) days[day] = windows;
  }
  const notes = optional(draft.schedule_notes);
  if (Object.keys(days).length === 0 && notes === null) return null;
  return { timezone: draft.timezone.trim(), days, notes };
}

/** A schedule in a comparable form: days in week order, windows by `opens`, empty = null. */
function canonicalSchedule(schedule: Schedule | null | undefined): Schedule | null {
  if (!schedule) return null;
  const days: Record<string, Array<{ opens: string; closes: string }>> = {};
  for (const day of WEEKDAYS) {
    const windows = dayWindows(schedule, day).map((w) => ({ opens: w.opens, closes: w.closes }));
    if (windows.length > 0) days[day] = windows;
  }
  const notes = schedule.notes ?? null;
  if (Object.keys(days).length === 0 && notes === null) return null;
  return { timezone: schedule.timezone ?? DEFAULT_TIMEZONE, days, notes };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The `practitioner_profile` part of the PUT body: only fields that differ
 * from what was read. An emptied optional field is sent as `null` (clears
 * it). The address and the services are sent whole when any part changed
 * (`clinic_address` replaces the whole address). Call after validation.
 */
export function buildProfileUpdate(
  profile: PractitionerProfile,
  draft: PractitionerProfileDraft,
): PractitionerProfileUpdate {
  const patch: PractitionerProfileUpdate = {};
  const setText = <
    K extends 'full_name' | 'specialization' | 'qualifications' | 'professional_highlights',
  >(
    key: K,
  ) => {
    const value = optional(draft[key]);
    if (value !== (profile[key] ?? null)) patch[key] = value;
  };
  const setInt = <K extends 'years_of_experience' | 'clinic_operating_since' | 'patients_treated'>(
    key: K,
  ) => {
    const raw = optional(draft[key]);
    const value = raw === null ? null : Number(raw);
    if (value !== (profile[key] ?? null)) patch[key] = value;
  };

  setText('full_name');
  setText('specialization');
  setText('qualifications');
  setInt('years_of_experience');

  const clinicName = draft.clinic_name.trim();
  if (clinicName !== profile.clinic_name) patch.clinic_name = clinicName;
  setInt('clinic_operating_since');

  const address: Address = {
    address_line: optional(draft.address.address_line),
    city: optional(draft.address.city),
    state: optional(draft.address.state),
    postal_code: optional(draft.address.postal_code),
    country: draft.address.country.trim().toUpperCase(),
  };
  const before = profile.clinic_address;
  const original: Address = {
    address_line: before.address_line ?? null,
    city: before.city ?? null,
    state: before.state ?? null,
    postal_code: before.postal_code ?? null,
    country: before.country ?? DEFAULT_COUNTRY,
  };
  if (!same(address, original)) patch.clinic_address = address;

  const schedule = draftSchedule(draft);
  if (!same(schedule, canonicalSchedule(profile.consultation_schedule))) {
    patch.consultation_schedule = schedule;
  }

  const holiday = WEEKDAYS.filter((d) => draft.weekly_holiday.includes(d));
  const holidayBefore = WEEKDAYS.filter((d) => profile.weekly_holiday.includes(d));
  if (!same(holiday, holidayBefore)) patch.weekly_holiday = holiday;

  const currency = draft.fee_currency.trim().toUpperCase();
  const minor =
    draft.fee_amount.trim() === '' ? null : parseMajorAmount(draft.fee_amount, currency);
  const fee: Fee | null = minor === null ? null : { amount_minor: minor, currency };
  const feeBefore = profile.consultation_fee
    ? {
        amount_minor: profile.consultation_fee.amount_minor,
        currency: profile.consultation_fee.currency ?? DEFAULT_CURRENCY,
      }
    : null;
  if (!same(fee, feeBefore)) patch.consultation_fee = fee;

  const services: Service[] = draft.services.filter(isFilledService).map((s) => ({
    name: s.name.trim(),
    category: optional(s.category),
    description: optional(s.description),
  }));
  const servicesBefore = profile.services.map((s) => ({
    name: s.name,
    category: s.category ?? null,
    description: s.description ?? null,
  }));
  if (!same(services, servicesBefore)) patch.services = services;

  setInt('patients_treated');
  setText('professional_highlights');
  return patch;
}

/** Fields that are stored on the main practitioner; changing one creates it when missing. */
const PRACTITIONER_KEYS = [
  'full_name',
  'specialization',
  'qualifications',
  'years_of_experience',
  'patients_treated',
  'professional_highlights',
  'consultation_schedule',
  'weekly_holiday',
  'consultation_fee',
] as const;

/**
 * Whether saving this patch needs `full_name`: the clinic has no main
 * practitioner yet and the patch writes practitioner fields (the API then
 * creates one, and requires the name).
 */
export function profileNeedsFullName(
  profile: PractitionerProfile,
  patch: PractitionerProfileUpdate,
): boolean {
  return profile.practitioner_id === null && PRACTITIONER_KEYS.some((k) => k in patch);
}

/**
 * API field errors (`ApiError.fieldErrors`, keyed like
 * `practitioner_profile.consultation_schedule.days.mon.1`) → the same keys
 * as `validateProfileDraft`, first message each. Errors outside the
 * Practitioner Profile (e.g. `version`) keep their key.
 */
export function profileErrorsFromApi(
  fieldErrors: Readonly<Record<string, ReadonlyArray<string>>> | undefined,
): ProfileErrors {
  const out: ProfileErrors = {};
  for (const [key, messages] of Object.entries(fieldErrors ?? {})) {
    const local = key.replace(/^practitioner_profile\.?/, '') || 'practitioner_profile';
    if (messages[0] && !out[local]) out[local] = messages[0];
  }
  return out;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Practitioner full name',
  specialization: 'Specialization',
  qualifications: 'Qualifications',
  years_of_experience: 'Total years of medical experience',
  clinic_name: 'Hospital / clinic name',
  clinic_operating_since: 'Operating since',
  clinic_address: 'Address',
  consultation_schedule: 'Consultation schedule',
  weekly_holiday: 'Weekly holiday',
  consultation_fee: 'Consultation fee',
  services: 'Services',
  patients_treated: 'Approximate patients treated',
  professional_highlights: 'Professional highlights',
};

/** A readable name for an error key, e.g. `consultation_schedule.days.mon.1` → "Consultation schedule, Monday, window 2". `labels` renames top-level fields. */
export function profileErrorLabel(
  key: string,
  labels: Readonly<Record<string, string>> = {},
): string {
  const [head = '', ...rest] = key.split('.');
  const parts = [labels[head] ?? FIELD_LABELS[head] ?? head.replace(/_/g, ' ')];
  for (let i = 0; i < rest.length; i += 1) {
    const part = rest[i]!;
    if (part === 'days') continue;
    if (part in WEEKDAY_LABELS) parts.push(WEEKDAY_LABELS[part as Weekday]);
    else if (/^\d+$/.test(part))
      parts.push(`${head === 'services' ? 'item' : 'window'} ${Number(part) + 1}`);
    else parts.push(part.replace(/_/g, ' '));
  }
  return parts.join(', ');
}

/** Empty window/service rows the forms add. */
export const emptyWindow = (): WindowDraft => ({ opens: '', closes: '' });
export const emptyService = (): ServiceDraft => ({ name: '', category: '', description: '' });

/**
 * Validates a draft and builds its partial update. The full name is required
 * once the clinic has a main practitioner (it cannot be cleared), and when
 * the save would create one.
 */
export function prepareProfileSave(
  profile: PractitionerProfile,
  draft: PractitionerProfileDraft,
  options: { currentYear?: number } = {},
): { errors: ProfileErrors; patch: PractitionerProfileUpdate } {
  const patch = buildProfileUpdate(profile, draft);
  const requireFullName = profile.practitioner_id !== null || profileNeedsFullName(profile, patch);
  const errors = validateProfileDraft(draft, { ...options, requireFullName });
  return { errors, patch };
}
