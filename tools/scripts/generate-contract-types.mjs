#!/usr/bin/env node
/**
 * Regenerates shared-types/src/contract/generated.ts from contracts/api/openapi.json.
 *
 * Uses openapi-typescript's programmatic API rather than a `pnpm exec`
 * subprocess, so it behaves the same on Linux CI and Windows workstations
 * (Node cannot spawn the pnpm.cmd shim without a shell).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';

const spec = resolve('contracts/api/openapi.json');
const out = resolve('packages/shared-types/src/contract/generated.ts');

if (!existsSync(spec)) {
  console.log('No contracts/api/openapi.json yet — keeping the placeholder contract types.');
  process.exit(0);
}

const version = readFileSync(resolve('contracts/api/VERSION'), 'utf8').trim();
const header = `/**
 * GENERATED from contracts/api/openapi.json (contract ${version}) by
 * tools/scripts/generate-contract-types.mjs. Do not edit by hand:
 * run \`pnpm api:sync --version <x.y.z>\`.
 */

`;

// defaultNonNullable: false — a property with a server-side default stays
// optional, so request bodies need not send it (e.g. ClinicCreate.country).
const ast = await openapiTS(JSON.parse(readFileSync(spec, 'utf8')), { defaultNonNullable: false });
writeFileSync(out, header + astToString(ast));
console.log(`Generated ${out} from contract ${version}.`);
