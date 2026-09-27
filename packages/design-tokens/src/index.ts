/**
 * @radial-pulse/design-tokens
 *
 * The TS object is the single source:
 *   - native consumes it directly
 *   - web consumes the generated CSS variables (@radial-pulse/design-tokens/css)
 */
export { tokens } from './tokens';
export type { Tokens, StatusTone, SeverityTone, AvatarTone, TextStyle, SpaceKey } from './tokens';
export { cssVarName, flattenTokens } from './css';
