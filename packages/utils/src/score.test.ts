import { describe, expect, it } from 'vitest';
import { formatComponentScore, formatScore, NOT_AVAILABLE_LABEL } from './score';

describe('formatComponentScore', () => {
  it('renders "Not Available" for a component without an engine, never 0', () => {
    const text = formatComponentScore({ status: 'not_available', score: null });
    expect(text).toBe(NOT_AVAILABLE_LABEL);
    expect(text).not.toBe('0');
  });

  it('renders pending and failed components by status, not as numbers', () => {
    expect(formatComponentScore({ status: 'pending', score: null })).toBe('Pending');
    expect(formatComponentScore({ status: 'failed', score: null })).toBe('Failed');
  });

  it('renders a real score of zero as 0', () => {
    expect(formatComponentScore({ status: 'completed', score: 0 })).toBe('0');
  });

  it('rounds completed scores for display', () => {
    expect(formatComponentScore({ status: 'completed', score: 72.6 })).toBe('73');
  });
});

describe('formatScore', () => {
  it('never turns a missing score into 0', () => {
    expect(formatScore(null)).toBe(NOT_AVAILABLE_LABEL);
    expect(formatScore(undefined, 'Pending')).toBe('Pending');
    expect(formatScore(0)).toBe('0');
  });
});
