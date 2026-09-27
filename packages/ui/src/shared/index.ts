/**
 * @radial-pulse/ui/shared — prop contracts and presentation helpers shared by
 * the web and native implementations. No DOM, no React Native.
 */
export type ComponentState = 'idle' | 'loading' | 'empty' | 'error';

export type * from './contracts';
export {
  avatarToneFor,
  displayHost,
  formatDateTime,
  formatMetricValue,
  getInitials,
} from './display';
export { getPageItems, getPageRange } from './pagination';
export type { PageItem } from './pagination';
