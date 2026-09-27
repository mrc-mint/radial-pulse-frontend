#!/usr/bin/env node
/** Regenerates shared-types/src/contract/generated.ts from contracts/api/openapi.json. */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const spec = 'contracts/api/openapi.json';
const out = 'packages/shared-types/src/contract/generated.ts';

if (!existsSync(spec)) {
  console.log(`No ${spec} yet — keeping the placeholder contract types.`);
  process.exit(0);
}
execFileSync('pnpm', ['exec', 'openapi-typescript', spec, '--output', out], { stdio: 'inherit' });
