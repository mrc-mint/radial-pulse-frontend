#!/usr/bin/env node
/**
 * pnpm api:sync --version 1.4.0
 *
 * Pulls openapi.json from the tagged backend release, stores it in
 * contracts/api/, and regenerates the contract types. Requires the GitHub CLI
 * (`gh`) authenticated with read access to the backend repository.
 *
 * Set BACKEND_REPO (owner/name) in the environment or .github/variables.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const version = args[args.indexOf('--version') + 1];
const repo = process.env.BACKEND_REPO;

if (!version || args.indexOf('--version') === -1) fail('Usage: pnpm api:sync --version <x.y.z>');
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`Not a semantic version: ${version}`);
if (!repo) fail('Set BACKEND_REPO=<owner>/<repo> (the backend repository).');

const dir = resolve('contracts/api');
execFileSync(
  'gh',
  ['release', 'download', `v${version}`, '--repo', repo, '--pattern', 'openapi.json', '--dir', dir, '--clobber'],
  { stdio: 'inherit' },
);
writeFileSync(resolve(dir, 'VERSION'), `${version}\n`);
execFileSync('node', ['tools/scripts/generate-contract-types.mjs'], { stdio: 'inherit' });
console.log(`\nSynced API contract ${version}. Commit contracts/api and shared-types in one PR.`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
