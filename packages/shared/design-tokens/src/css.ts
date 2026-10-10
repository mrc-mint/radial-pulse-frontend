/**
 * Serializes the token object into CSS custom properties.
 *
 * Pure and dependency-free so it can be used both by the generator script
 * (scripts/generate-css.ts) and by the drift test that keeps tokens.css in sync.
 *
 * Naming: `tokens.color.action.primary.bgHover` → `--rp-color-action-primary-bg-hover`.
 * The raw `palette` is not emitted: components use semantic roles only.
 */
export const CSS_VAR_PREFIX = '--rp';

type Unit = 'px' | 'ms' | '';

/** Unit for a numeric token, decided by its path. Strings are emitted as-is. */
function unitFor(path: readonly string[]): Unit {
  const [group] = path;
  const leaf = path[path.length - 1];
  if (group === 'zIndex') return '';
  if (group === 'font' && path[1] === 'weight') return '';
  if (group === 'text' && leaf === 'weight') return '';
  if (group === 'motion') return 'ms';
  return 'px';
}

function toKebab(segment: string): string {
  return segment
    .replace(/\./g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function cssVarName(path: readonly string[]): string {
  return `${CSS_VAR_PREFIX}-${path.map(toKebab).join('-')}`;
}

function formatValue(value: string | number, path: readonly string[]): string {
  if (typeof value === 'string') return value;
  if (value === 0) return '0';
  return `${value}${unitFor(path)}`;
}

/** Flattens a token tree into [name, value] pairs in source order. */
export function flattenTokens(
  tree: Record<string, unknown>,
  path: readonly string[] = [],
): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(tree)) {
    const next = [...path, key];
    if (typeof value === 'string' || typeof value === 'number') {
      out.push([cssVarName(next), formatValue(value, next)]);
    } else if (value && typeof value === 'object') {
      out.push(...flattenTokens(value as Record<string, unknown>, next));
    }
  }
  return out;
}

const HEADER = `/*
 * GENERATED FILE — do not edit by hand.
 * Source: packages/shared/design-tokens/src/tokens.ts
 * Regenerate: pnpm --filter @radial-pulse/design-tokens generate
 */`;

export function tokensToCss(tokens: Record<string, unknown>): string {
  const semantic = Object.fromEntries(Object.entries(tokens).filter(([key]) => key !== 'palette'));
  const lines = flattenTokens(semantic).map(([name, value]) => `  ${name}: ${value};`);
  return `${HEADER}\n:root {\n${lines.join('\n')}\n}\n`;
}
