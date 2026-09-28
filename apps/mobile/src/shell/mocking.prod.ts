import type { startMocking as StartMocking } from './mocking';

/** Production stand-in for ./mocking (see metro.config.js): mocks never ship. */
export const startMocking: typeof StartMocking = () => {
  throw new Error('API mocking is not available in production builds.');
};
