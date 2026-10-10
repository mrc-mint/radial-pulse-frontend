import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { cssVarName, flattenTokens, tokensToCss } from './css';
import { formatTokensCss } from './format';
import { tokens } from './tokens';

describe('tokensToCss', () => {
  it('matches the committed tokens.css (run `generate` after editing tokens.ts)', async () => {
    const path = fileURLToPath(new URL('./tokens.css', import.meta.url));
    const committed = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
    expect(committed).toBe(await formatTokensCss(tokens, path));
  });

  it('never emits raw palette values as variables', () => {
    expect(tokensToCss(tokens)).not.toContain('--rp-palette');
  });

  it('applies units by token group', () => {
    const vars = Object.fromEntries(
      flattenTokens({
        space: { 4: 16, '0.5': 2 },
        font: { weight: { bold: 700 } },
        motion: { duration: { fast: 120 } },
        zIndex: { modal: 1200 },
      }),
    );
    expect(vars).toEqual({
      '--rp-space-4': '16px',
      '--rp-space-0-5': '2px',
      '--rp-font-weight-bold': '700',
      '--rp-motion-duration-fast': '120ms',
      '--rp-z-index-modal': '1200',
    });
  });

  it('kebab-cases camelCase segments', () => {
    expect(cssVarName(['color', 'action', 'primary', 'bgHover'])).toBe(
      '--rp-color-action-primary-bg-hover',
    );
  });
});
