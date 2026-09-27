import { NOT_AVAILABLE_LABEL } from '@radial-pulse/utils';
import { describe, expect, it } from 'vitest';
import {
  avatarToneFor,
  displayHost,
  formatDateTime,
  formatMetricValue,
  getInitials,
} from './display';

describe('getInitials', () => {
  it.each([
    ['Rohan Agarwal', 'RA'],
    ['Dr. Rahul Mehta', 'RM'],
    ['Smile Dental Care', 'SC'],
    ['Priya', 'PR'],
    ['  ', '?'],
  ])('%s → %s', (name, expected) => expect(getInitials(name)).toBe(expected));
});

describe('avatarToneFor', () => {
  it('is stable for the same name', () => {
    expect(avatarToneFor('Priya Shah')).toBe(avatarToneFor('Priya Shah'));
  });
});

describe('formatMetricValue', () => {
  it('renders missing values as Not Available, never 0', () => {
    expect(formatMetricValue(null)).toBe(NOT_AVAILABLE_LABEL);
    expect(formatMetricValue(undefined)).toBe(NOT_AVAILABLE_LABEL);
    expect(formatMetricValue(Number.NaN)).toBe(NOT_AVAILABLE_LABEL);
  });

  it('keeps a real zero', () => {
    expect(formatMetricValue(0, 'en-US')).toBe('0');
  });

  it('groups numbers and passes strings through', () => {
    expect(formatMetricValue(12480, 'en-US')).toBe('12,480');
    expect(formatMetricValue('4.2%')).toBe('4.2%');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO timestamp', () => {
    expect(formatDateTime('2024-09-12T05:00:00Z', { timeZone: 'Asia/Kolkata' })).toMatch(
      /^12 Sept? 2024, 10:30$/,
    );
  });

  it('returns null for invalid input', () => {
    expect(formatDateTime('not a date')).toBeNull();
  });
});

describe('displayHost', () => {
  it('strips protocol, www and path', () => {
    expect(displayHost('https://www.smiledentalcare.in/about')).toBe('smiledentalcare.in');
  });

  it('returns the input when it is not a URL', () => {
    expect(displayHost('smiledentalcare.in')).toBe('smiledentalcare.in');
  });
});
