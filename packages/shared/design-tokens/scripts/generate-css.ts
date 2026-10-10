/**
 * Writes src/tokens.css from src/tokens.ts.
 *
 * Run: pnpm --filter @radial-pulse/design-tokens generate
 * Uses Node's built-in TypeScript type stripping (no extra tooling), which is
 * why the imports below carry explicit .ts extensions.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatTokensCss } from '../src/format.ts';
import { tokens } from '../src/tokens.ts';

const target = fileURLToPath(new URL('../src/tokens.css', import.meta.url));
writeFileSync(target, await formatTokensCss(tokens, target));
console.log(`Wrote ${target}`);
