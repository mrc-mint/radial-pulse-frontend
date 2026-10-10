#!/usr/bin/env node
/**
 * CI guard: the committed contract types must equal what the committed
 * contract snapshot generates. Fails if generated.ts was hand-edited or the
 * snapshot changed without regenerating.
 */
import { execFileSync } from 'node:child_process';

execFileSync('node', ['tools/scripts/generate-contract-types.mjs'], { stdio: 'inherit' });
try {
  execFileSync(
    'git',
    ['diff', '--exit-code', '--', 'packages/shared/types/src/contract/generated.ts'],
    {
      stdio: 'inherit',
    },
  );
  console.log('Contract types are in sync with contracts/api/openapi.json.');
} catch {
  console.error(
    '\nContract types are out of sync. Run `pnpm api:sync` instead of editing generated.ts.',
  );
  process.exit(1);
}
