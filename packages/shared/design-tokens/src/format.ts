import { format, resolveConfig } from 'prettier';
import { tokensToCss } from './css.ts';

/**
 * tokens.css exactly as committed: serialized, then formatted with the
 * repository's Prettier config so `format:check` never disagrees with the
 * generator. Build-time only — not exported from the package entry.
 */
export async function formatTokensCss(
  tokens: Record<string, unknown>,
  filepath: string,
): Promise<string> {
  const config = (await resolveConfig(filepath)) ?? {};
  return format(tokensToCss(tokens), { ...config, filepath, parser: 'css' });
}
