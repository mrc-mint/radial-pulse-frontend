/**
 * @radial-pulse/design-tokens
 *
 * PHASE 2 STUB. The real token set (semantic colors incl. severity/status,
 * typography, spacing, radius, shadow, breakpoints, component tokens) is
 * designed in Phase 3. From then on this TS object is the single source:
 *   - native consumes it directly (theme hook)
 *   - web consumes generated CSS variables (@radial-pulse/design-tokens/css)
 */
export const tokens = {
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
  radius: { sm: 4, md: 8, lg: 12 },
} as const;

export type Tokens = typeof tokens;
