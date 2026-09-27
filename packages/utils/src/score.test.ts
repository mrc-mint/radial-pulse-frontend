import { describe, expect, it } from 'vitest';
import { formatComponentScore, NOT_AVAILABLE_LABEL } from './score';

describe('formatComponentScore', () => {
  it('renders "Not Available" for an unavailable component, never 0', () => {
    const text = formatComponentScore({ availability: 'not_available' });
    expect(text).toBe(NOT_AVAILABLE_LABEL);
    expect(text).not.toBe('0');
  });

  it('renders a real score of zero as 0', () => {
    expect(formatComponentScore({ availability: 'available', score: 0 })).toBe('0');
  });

  it('rounds available scores for display', () => {
    expect(formatComponentScore({ availability: 'available', score: 72.6 })).toBe('73');
  });
});
