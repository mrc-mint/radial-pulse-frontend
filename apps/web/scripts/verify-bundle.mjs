#!/usr/bin/env node
/**
 * Verifies Studio's production bundle keeps the contract mocks out of the
 * application's startup path (ADR 0003, ADR 0009).
 *
 * The same artifact is promoted from dev to prod, and dev may run with
 * `apiMocking`, so the mocks stay in the artifact as a lazily loaded chunk
 * plus public/mockServiceWorker.js. createConfig() refuses `apiMocking` in
 * prod, so that chunk is never requested there. This check fails the build if
 * mock code becomes reachable from index.html through static imports, i.e. if
 * it would be downloaded and evaluated at startup.
 *
 * Mock code is identified by source maps: a chunk is a mock chunk when any of
 * its sources come from @radial-pulse/api-mocks, MSW, or the app mocking module.
 *
 * Run through Nx: pnpm nx run @radial-pulse/web:verify-bundle (after build).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const MOCK_SOURCES = [
  /packages\/shared\/api-mocks\//,
  /node_modules\/msw\//,
  /src\/app\/mocking\.ts$/,
];

function fail(message) {
  console.error(`verify-bundle: ${message}`);
  process.exit(1);
}

if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html not found; run the build first.');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const entries = [
  ...html.matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g),
].map((m) => m[1]);
if (entries.length === 0) fail('no module entry found in dist/index.html.');

const jsFiles = readdirSync(join(dist, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => `assets/${f}`);

/** Static (eagerly evaluated) imports of a chunk; dynamic import() is excluded. */
function staticImports(file) {
  const code = readFileSync(join(dist, file), 'utf8');
  const found = new Set();
  const re =
    /(?:^|[;\s})])(?:import|export)\s*(?:[\w$*{}\s,]*?\s*from\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g;
  for (const m of code.matchAll(re)) found.add(posix.join(posix.dirname(file), m[1]));
  return found;
}

/** Whether a chunk's source map lists mock sources. */
function isMockChunk(file) {
  const mapFile = join(dist, `${file}.map`);
  if (!existsSync(mapFile))
    fail(`${file}.map not found: source maps are required to identify mock code.`);
  const { sources = [] } = JSON.parse(readFileSync(mapFile, 'utf8'));
  return sources.some((s) => MOCK_SOURCES.some((re) => re.test(s.replace(/\\/g, '/'))));
}

// Everything reachable from index.html through static imports.
const eager = new Set();
const queue = [...entries];
while (queue.length) {
  const file = queue.shift();
  if (eager.has(file)) continue;
  if (!existsSync(join(dist, file))) fail(`${file} is referenced but missing from dist.`);
  eager.add(file);
  for (const dep of staticImports(file)) queue.push(dep);
}

const mockChunks = jsFiles.filter(isMockChunk);
const leaked = mockChunks.filter((f) => eager.has(f));
const size = (f) => (existsSync(join(dist, f)) ? statSync(join(dist, f)).size : 0);
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

console.log(
  `Startup path: ${eager.size} chunk(s), ${kb([...eager].reduce((n, f) => n + size(f), 0))}`,
);
for (const f of mockChunks) {
  console.log(`Mock chunk (lazy): ${f} ${kb(size(f))}, source map ${kb(size(`${f}.map`))}`);
}
console.log(`Service worker: mockServiceWorker.js ${kb(size('mockServiceWorker.js'))}`);

if (leaked.length) fail(`mock code is statically reachable from index.html: ${leaked.join(', ')}`);
console.log('verify-bundle: OK, mock code is only loaded on demand (apiMocking, never in prod).');
