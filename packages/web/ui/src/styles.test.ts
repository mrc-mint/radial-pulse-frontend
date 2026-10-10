/// <reference types="node" />
import { flattenTokens, tokens } from '@radial-pulse/design-tokens';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Guards "no hard-coded design values": every --rp-* variable used by the web
 * styles must exist in the generated token set, and colours must come from
 * tokens rather than literals.
 */
const dir = fileURLToPath(new URL('.', import.meta.url));
const sheets = readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => ({ file: f, css: readFileSync(`${dir}/${f}`, 'utf8') }));

const semantic = Object.fromEntries(Object.entries(tokens).filter(([key]) => key !== 'palette'));
const defined = new Set(flattenTokens(semantic).map(([name]) => name));

describe('web styles', () => {
  it.each(sheets)('$file only references defined tokens', ({ css }) => {
    const used = [...css.matchAll(/var\((--rp-[a-z0-9-]+)/g)].map((m) => m[1]);
    expect(used.filter((name) => !defined.has(name!))).toEqual([]);
  });

  it.each(sheets)('$file has no literal colours', ({ css }) => {
    expect(css.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi)).toBeNull();
  });
});
