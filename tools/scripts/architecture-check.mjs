#!/usr/bin/env node
/**
 * Proves the architecture rules are enforced, not just configured.
 *
 * 1. Lints known-bad and known-good snippets with the real eslint.config.mjs
 *    (as if they were files at the given paths) and fails if a forbidden
 *    import or global is accepted, or an allowed one is rejected.
 * 2. Compares each project's declared @radial-pulse/* dependencies with the
 *    workspace packages its tracked source files actually import.
 *
 * Run: pnpm architecture:check (also a CI step).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { ESLint } from 'eslint';

const NX = '@nx/enforce-module-boundaries';
const IMPORTS = 'no-restricted-imports';
const FEATURE = 'local/feature-boundaries';
const GLOBALS = 'no-restricted-globals';
const PROPS = 'no-restricted-properties';
/** Only these rules (and parse errors) count; e.g. unused imports in a snippet do not. */
const ARCHITECTURE_RULES = new Set([NX, IMPORTS, FEATURE, GLOBALS, PROPS, null]);

/** [file the snippet pretends to be, code, rule that must fire | null = must be clean]. */
const CASES = [
  // ── Feature folders inside apps: any import form between features fails.
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { clinicsModule } from '../clinics/manifest';",
    FEATURE,
  ],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { clinicsModule } from '../../modules/clinics/manifest';",
    FEATURE,
  ],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { x } from './../settings/settings-page';",
    FEATURE,
  ],
  ['apps/web/src/modules/dashboard/probe.ts', "export * from '../clinics/manifest';", FEATURE],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "export const m = import('../clinics/manifest');",
    FEATURE,
  ],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "export type M = typeof import('../clinics/manifest');",
    FEATURE,
  ],
  ['apps/web/src/modules/dashboard/probe.test.ts', "vi.mock('../clinics/manifest');", FEATURE],
  [
    'apps/mobile/src/modules/home/probe.ts',
    "import { CHAT_PERMISSION } from '../chat/manifest';",
    FEATURE,
  ],
  ['apps/web/src/modules/dashboard/probe.ts', "import { x } from './attention';", null],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { QueryError } from '../../app/page-kit';",
    null,
  ],
  ['apps/mobile/src/modules/home/probe.ts', "import { x } from '../../shell/kit';", null],
  [
    'apps/web/src/app/probe.ts',
    "import { clinicsModule } from '../modules/clinics/manifest';",
    null,
  ],

  // ── Web and mobile never meet (package and relative imports).
  ['packages/web/ui/src/probe.ts', "import { Button } from '@radial-pulse/mobile-ui';", NX],
  ['packages/web/ui/src/probe.ts', "import { Button } from '../../../mobile/ui/src/button';", NX],
  [
    'packages/mobile/shell/src/probe.ts',
    "import { WebAppShell } from '@radial-pulse/web-shell';",
    NX,
  ],
  ['packages/mobile/ui/src/probe.ts', "import { Button } from '@radial-pulse/web-ui';", NX],
  ['apps/web/src/app/probe.ts', "import { Button } from '@radial-pulse/mobile-ui';", NX],
  ['apps/mobile/src/shell/probe.ts', "import { Button } from '@radial-pulse/web-ui';", NX],
  ['packages/web/ui/src/probe.ts', "import { View } from 'react-native';", NX],
  ['packages/mobile/ui/src/probe.ts', "import { createPortal } from 'react-dom';", NX],
  ['apps/web/src/app/probe.ts', "import { View } from 'react-native';", IMPORTS],
  ['apps/mobile/src/shell/probe.ts', "import { createPortal } from 'react-dom';", IMPORTS],

  // ── Platform-neutral projects depend only on neutral projects and packages.
  ['packages/shared/ui/src/probe.ts', "import { Button } from '@radial-pulse/web-ui';", NX],
  [
    'packages/shared/shell-core/src/probe.ts',
    "import { WebAppShell } from '@radial-pulse/web-shell';",
    NX,
  ],
  [
    'packages/shared/shell-core/src/probe.ts',
    "import { Screen } from '@radial-pulse/mobile-shell';",
    NX,
  ],
  ['packages/shared/ui/src/probe.ts', "import { createPortal } from 'react-dom';", NX],
  ['packages/shared/api-client/src/probe.ts', "import { View } from 'react-native';", NX],

  // ── Utilities depend only on utilities and types; no React, no MSW.
  [
    'packages/shared/utils/src/probe.ts',
    "import { findingCardProps } from '@radial-pulse/ui-shared';",
    NX,
  ],
  [
    'packages/shared/utils/src/probe.ts',
    "import { clinicsService } from '@radial-pulse/api-client';",
    NX,
  ],
  [
    'packages/shared/utils/src/probe.ts',
    "import { useSession } from '@radial-pulse/shell-core';",
    NX,
  ],
  ['packages/shared/utils/src/probe.ts', "import { useState } from 'react';", NX],
  ['packages/shared/config/src/probe.ts', "import { can } from '@radial-pulse/utils';", null],
  [
    'packages/shared/utils/src/probe.ts',
    "import type { Schema } from '@radial-pulse/shared-types';",
    null,
  ],

  // ── Libraries never import apps (by package name or path).
  ['packages/shared/utils/src/probe.ts', "import { App } from '@radial-pulse/web';", IMPORTS],
  ['packages/web/shell/src/probe.ts', "import { x } from '@radial-pulse/mobile';", NX],
  [
    'packages/web/ui/src/probe.ts',
    "import { x } from '../../../../apps/web/src/app/page-kit';",
    NX,
  ],

  // ── Layers and cycles.
  [
    'packages/shared/ui/src/probe.ts',
    "import { clinicsService } from '@radial-pulse/api-client';",
    NX,
  ],
  [
    'packages/shared/api-client/src/probe.ts',
    "import { createAppServices } from '@radial-pulse/auth';",
    NX,
  ],
  [
    'packages/shared/auth/src/probe.ts',
    "import { useSession } from '@radial-pulse/shell-core';",
    NX,
  ],
  ['packages/web/ui/src/probe.ts', "import { WebAppShell } from '@radial-pulse/web-shell';", NX],
  [
    'packages/web/shell/src/probe.ts',
    "import { useSession } from '@radial-pulse/shell-core';",
    null,
  ],
  [
    'packages/shared/auth/src/probe.ts',
    "import { clinicsService } from '@radial-pulse/api-client';",
    null,
  ],

  // ── Mocks are dev/test only.
  [
    'packages/shared/shell-core/src/probe.ts',
    "import { MOCK_PERSONAS } from '@radial-pulse/api-mocks';",
    NX,
  ],
  ['packages/shared/api-client/src/probe.ts', "import { http } from 'msw';", NX],
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { MOCK_PERSONAS } from '@radial-pulse/api-mocks';",
    IMPORTS,
  ],
  ['apps/web/src/app/probe.ts', "import { setupWorker } from 'msw/browser';", IMPORTS],
  [
    'apps/mobile/src/modules/home/probe.ts',
    "import { createMockFetch } from '@radial-pulse/api-mocks';",
    IMPORTS,
  ],
  ['apps/web/src/app/mocking.ts', "import { MOCK_PERSONAS } from '@radial-pulse/api-mocks';", null],
  [
    'apps/mobile/src/shell/mocking.ts',
    "import { createMockFetch } from '@radial-pulse/api-mocks';",
    null,
  ],
  ['apps/web/src/app/probe.test.ts', "import { setupServer } from 'msw/node';", null],

  // ── Apps never talk HTTP themselves.
  ['apps/web/src/modules/dashboard/probe.ts', "import createClient from 'openapi-fetch';", IMPORTS],

  // ── Positive controls: the normal dependency directions stay allowed.
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "import { Button } from '@radial-pulse/web-ui';",
    null,
  ],
  [
    'apps/mobile/src/modules/home/probe.ts',
    "import { Button } from '@radial-pulse/mobile-ui';",
    null,
  ],
  ['packages/web/ui/src/probe.ts', "import { formatDate } from '@radial-pulse/ui-shared';", null],
  [
    'packages/shared/api-client-react/src/probe.ts',
    "import { clinicsService } from '@radial-pulse/api-client';",
    null,
  ],
];

/** Feature libraries (ADR 0010): [file, code, rule | null]. */
const FEATURE_CASES = [
  // A feature never imports another feature, in any import form.
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { ClinicsPage } from '@radial-pulse/studio-clinics';",
    NX,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { clinicsModule } from '@radial-pulse/studio-clinics/manifest';",
    NX,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { x } from '../../studio-clinics/src/clinics-page';",
    NX,
  ],
  ['packages/web/studio-dashboard/src/probe.ts', "export * from '@radial-pulse/studio-users';", NX],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "export const m = import('@radial-pulse/studio-chat');",
    NX,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { CHAT_PERMISSION } from '@radial-pulse/clinic-chat/manifest';",
    NX,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { x } from '../../clinic-profile/src/profile-screen';",
    NX,
  ],
  [
    'packages/mobile/clinic-insights/src/probe.ts',
    "import { AssessmentsScreen } from '@radial-pulse/clinic-assessments';",
    NX,
  ],
  // Features build on their platform's kit and lower libraries.
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { QueryError } from '@radial-pulse/studio-kit';",
    null,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { WebAppShell } from '@radial-pulse/web-shell';",
    null,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { ListRow } from '@radial-pulse/clinic-kit';",
    null,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { Screen } from '@radial-pulse/mobile-shell';",
    null,
  ],
  // Platform separation for features and kits.
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { ListRow } from '@radial-pulse/clinic-kit';",
    NX,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { HomeScreen } from '@radial-pulse/clinic-home';",
    NX,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { QueryError } from '@radial-pulse/studio-kit';",
    NX,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { Button } from '@radial-pulse/web-ui';",
    NX,
  ],
  // Lower layers and kits never depend on features.
  [
    'packages/web/studio-kit/src/probe.ts',
    "import { DashboardPage } from '@radial-pulse/studio-dashboard';",
    NX,
  ],
  [
    'packages/mobile/clinic-kit/src/probe.ts',
    "import { HomeScreen } from '@radial-pulse/clinic-home';",
    NX,
  ],
  ['packages/web/shell/src/probe.ts', "import { QueryError } from '@radial-pulse/studio-kit';", NX],
  [
    'packages/shared/shell-core/src/probe.ts',
    "import { DashboardPage } from '@radial-pulse/studio-dashboard';",
    NX,
  ],
  // Features never import apps, mocks or MSW, the raw API client, or call fetch.
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { App } from '@radial-pulse/web';",
    IMPORTS,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { x } from '../../../../apps/web/src/app/shell';",
    NX,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import { MOCK_PERSONAS } from '@radial-pulse/api-mocks';",
    NX,
  ],
  ['packages/mobile/clinic-home/src/probe.ts', "import { http } from 'msw';", NX],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "import createClient from 'openapi-fetch';",
    IMPORTS,
  ],
  [
    'packages/mobile/clinic-home/src/probe.ts',
    "import { useApiClient } from '@radial-pulse/api-client-react';",
    IMPORTS,
  ],
  [
    'packages/web/studio-dashboard/src/probe.ts',
    "export const a = fetch('/api/v1/clinics');",
    GLOBALS,
  ],
  ['packages/mobile/clinic-home/src/probe.ts', "export const a = globalThis.fetch('/x');", PROPS],
  ['packages/mobile/clinic-home/src/probe.ts', 'export const a = document.title;', GLOBALS],
  // Apps compose features through their public entry points.
  [
    'apps/web/src/routes/probe.tsx',
    "import { DashboardPage } from '@radial-pulse/studio-dashboard';",
    null,
  ],
  [
    'apps/mobile/app/probe.tsx',
    "export { HomeScreen as default } from '@radial-pulse/clinic-home';",
    null,
  ],
];

/** Platform globals: [file, code, rule | null]. Extended by the platform-boundary rules. */
const GLOBAL_CASES = [
  ['packages/shared/utils/src/probe.ts', 'export const a = window.location.href;', GLOBALS],
  ['packages/shared/utils/src/probe.ts', 'export const a = document.title;', GLOBALS],
  ['packages/shared/config/src/probe.ts', 'export const a = process.cwd();', GLOBALS],
  [
    'packages/shared/api-client/src/probe.ts',
    "export const a = localStorage.getItem('k');",
    GLOBALS,
  ],
  ['packages/shared/api-client/src/probe.ts', 'export const a = navigator.userAgent;', GLOBALS],
  [
    'packages/shared/shell-core/src/probe.ts',
    "export const a = globalThis.localStorage.getItem('k');",
    PROPS,
  ],
  ['packages/shared/ui/src/probe.ts', "export const a = Buffer.from('x');", GLOBALS],
  ['packages/shared/auth/src/probe.ts', 'export const a = document.cookie;', GLOBALS],
  ['packages/mobile/ui/src/probe.ts', 'export const a = document.title;', GLOBALS],
  ['apps/mobile/src/modules/home/probe.ts', "export const a = localStorage.getItem('k');", GLOBALS],
  ['packages/shared/api-client/src/probe.ts', "export const a = fetch('/x');", null],
  ['packages/shared/api-client/src/probe.ts', 'export const a = new URL("https://x.test");', null],
  ['packages/web/ui/src/probe.ts', 'export const a = document.title;', null],
  // Screens never call fetch (API data comes from api-client-react hooks).
  [
    'apps/web/src/modules/dashboard/probe.ts',
    "export const a = fetch('/api/v1/clinics');",
    GLOBALS,
  ],
  [
    'apps/web/src/routes/_app/probe.tsx',
    "export const a = window.fetch('/api/v1/clinics');",
    PROPS,
  ],
  ['apps/mobile/src/modules/home/probe.ts', "export const a = fetch('/api/v1/clinics');", GLOBALS],
  ['apps/mobile/app/(app)/probe.tsx', "export const a = globalThis.fetch('/x');", PROPS],
  // ...without dropping the mobile bans on the same files.
  ['apps/mobile/src/modules/home/probe.ts', 'export const a = document.title;', GLOBALS],
  ['apps/mobile/src/shell/probe.ts', "export const a = localStorage.getItem('k');", GLOBALS],
  // Composition and config code may still use fetch (runtime config, API client wiring).
  ['apps/web/src/lib/probe.ts', "export const a = fetch('/config.json');", null],
  ['apps/mobile/src/shell/probe.ts', "export const a = fetch('file:///x');", null],
  ['apps/web/src/modules/dashboard/probe.test.ts', "export const a = fetch('/x');", null],
  ['apps/web/src/app/probe.ts', 'export const a = window.location.href;', null],
];

// @nx/enforce-module-boundaries reads the cached Nx project graph and silently
// skips itself without one (e.g. a fresh CI checkout before any nx command),
// so build the graph first.
execFileSync(
  process.execPath,
  [createRequire(import.meta.url).resolve('nx/bin/nx.js'), 'show', 'projects'],
  { stdio: 'ignore', env: { ...process.env, NX_DAEMON: 'false' } },
);

const eslint = new ESLint({ cwd: process.cwd() });
let failures = 0;

async function runCases(title, cases) {
  console.log(`\n${title}`);
  for (const [file, code, expected] of cases) {
    const [result] = await eslint.lintText(`${code}\n`, { filePath: file });
    const rules = [
      ...new Set(
        result.messages
          .filter((m) => m.severity === 2 && ARCHITECTURE_RULES.has(m.ruleId))
          .map((m) => m.ruleId ?? 'parse'),
      ),
    ];
    const ok = expected === null ? rules.length === 0 : rules.includes(expected);
    if (!ok) failures++;
    const want = expected ?? 'allowed';
    const got = rules.length ? rules.join(', ') : 'no errors';
    console.log(
      `  ${ok ? 'ok  ' : 'FAIL'} ${file} :: ${code}\n         expected ${want}; got ${got}`,
    );
  }
}

await runCases('Import and dependency rules', CASES);
await runCases('Platform globals', GLOBAL_CASES);
await runCases('Feature libraries', FEATURE_CASES);

// ── Features are libraries, not app folders (ADR 0010) ─────────────────────────
console.log('\nFeature folders inside apps');
for (const app of ['web', 'mobile']) {
  const dir = `apps/${app}/src/modules`;
  const ok = !existsSync(dir);
  if (!ok) failures++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${dir} ${ok ? 'absent' : 'exists: move features into packages/' + app + '/'}`,
  );
}

// ── Declared workspace dependencies vs actual imports ────────────────────────
console.log('\nWorkspace dependencies (declared vs imported)');
const manifests = execFileSync(
  'git',
  ['ls-files', '-co', '--exclude-standard', 'apps/*/package.json', 'packages/*/*/package.json'],
  {
    encoding: 'utf8',
  },
)
  .trim()
  .split('\n');
if (manifests.length < 2) {
  console.error('No project manifests found.');
  process.exit(1);
}
console.log(`  (${manifests.length} projects)`);
const names = new Map(manifests.map((m) => [JSON.parse(readFileSync(m, 'utf8')).name, m]));
for (const manifest of manifests) {
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  const root = dirname(manifest);
  const declared = new Set(
    ['dependencies', 'devDependencies', 'peerDependencies']
      .flatMap((k) => Object.keys(pkg[k] ?? {}))
      .filter((d) => names.has(d)),
  );
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', root], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter((f) => /\.(ts|tsx|js|mjs|cjs|css)$/.test(f) && !f.endsWith('.gen.ts'));
  const used = new Set();
  for (const f of files) {
    for (const m of readFileSync(join(f), 'utf8').matchAll(
      /['"](@radial-pulse\/[a-z-]+)(?:\/[^'"]*)?['"]/g,
    )) {
      if (names.has(m[1]) && m[1] !== pkg.name) used.add(m[1]);
    }
  }
  const missing = [...used].filter((d) => !declared.has(d));
  const unused = [...declared].filter((d) => !used.has(d));
  const ok = missing.length === 0 && unused.length === 0;
  if (!ok) failures++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${pkg.name}${missing.length ? ` undeclared: ${missing.join(', ')}` : ''}${unused.length ? ` unused: ${unused.join(', ')}` : ''}`,
  );
}

if (failures) {
  console.error(`\nArchitecture check failed: ${failures} problem(s).`);
  process.exit(1);
}
console.log('\nArchitecture check passed.');
