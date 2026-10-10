// Root flat config. Every project runs `eslint .` and inherits this file.
// Architecture: docs/architecture.md §3 and docs/adr/0009-library-structure.md.
// `pnpm architecture:check` proves the rules below reject what they should.
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import local from './tools/eslint/feature-boundaries.mjs';

// ── Project dependency rules (tags live in each package.json "nx.tags") ──────
// Every project has one `type:*` and one `platform:*` tag. Nx checks every
// constraint whose source tag the importing project has, and rejects imports
// that cross into another project by a relative or absolute path.
const NO_MSW = ['msw', 'msw/*'];
const DOM_PACKAGES = ['react-dom', 'react-dom/*', 'react-aria-components', 'lucide-react'];
const NATIVE_PACKAGES = [
  'react-native',
  'react-native/*',
  'react-native-*',
  '@react-native/*',
  '@react-native-async-storage/*',
  'expo',
  'expo-*',
  '@expo/*',
  '@expo-google-fonts/*',
  'lucide-react-native',
];
const REACT_PACKAGES = ['react', 'react/*', '@tanstack/react-query', ...DOM_PACKAGES];

const depConstraints = [
  // Layers (low to high): types < util < ui | data-access < shell < app.
  { sourceTag: 'type:types', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util', 'type:types'] },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:types'] },
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:types'],
  },
  // Dev/test-only contract mocks: built on data access, used only by apps.
  {
    sourceTag: 'type:mocks',
    onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:types'],
  },
  {
    sourceTag: 'type:shell',
    onlyDependOnLibsWithTags: [
      'type:shell',
      'type:ui',
      'type:data-access',
      'type:util',
      'type:types',
    ],
  },
  // Feature libraries (ADR 0010): one per business domain, never another
  // feature. Shared feature building blocks live in the app's kit.
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: [
      'type:feature-kit',
      'type:shell',
      'type:ui',
      'type:data-access',
      'type:util',
      'type:types',
    ],
  },
  {
    sourceTag: 'type:feature-kit',
    onlyDependOnLibsWithTags: [
      'type:shell',
      'type:ui',
      'type:data-access',
      'type:util',
      'type:types',
    ],
  },
  {
    sourceTag: 'type:app',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:feature-kit',
      'type:shell',
      'type:ui',
      'type:data-access',
      'type:mocks',
      'type:util',
      'type:types',
    ],
  },

  // Platforms: web and mobile never meet; neutral code depends only on neutral code.
  {
    sourceTag: 'platform:neutral',
    onlyDependOnLibsWithTags: ['platform:neutral'],
    bannedExternalImports: [...DOM_PACKAGES, ...NATIVE_PACKAGES],
  },
  {
    sourceTag: 'platform:web',
    onlyDependOnLibsWithTags: ['platform:web', 'platform:neutral'],
    bannedExternalImports: NATIVE_PACKAGES,
  },
  {
    sourceTag: 'platform:mobile',
    onlyDependOnLibsWithTags: ['platform:mobile', 'platform:neutral'],
    bannedExternalImports: DOM_PACKAGES,
  },

  // External packages by layer: utilities and types stay free of React; only
  // the mocks library (and app mocking modules, see below) may import MSW.
  {
    sourceTag: 'type:types',
    bannedExternalImports: [...REACT_PACKAGES, ...NO_MSW],
  },
  {
    sourceTag: 'type:util',
    bannedExternalImports: [...REACT_PACKAGES, ...NO_MSW],
  },
  { sourceTag: 'type:ui', bannedExternalImports: NO_MSW },
  { sourceTag: 'type:data-access', bannedExternalImports: NO_MSW },
  { sourceTag: 'type:shell', bannedExternalImports: NO_MSW },
  { sourceTag: 'type:feature', bannedExternalImports: NO_MSW },
  { sourceTag: 'type:feature-kit', bannedExternalImports: NO_MSW },
];

// ── Platform globals ──────────────────────────────────────────────────────────
// TypeScript files get no ESLint environment globals (typescript-eslint turns
// no-undef off for them; tsc checks names). Platform-specific globals are
// banned explicitly where they do not exist or must not be used.
const BROWSER_GLOBALS = [
  'window',
  'self',
  'document',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'navigator',
  'location',
  'history',
];
const NODE_GLOBALS = ['process', 'Buffer', 'global', '__dirname', '__filename'];
const restrictedGlobals = (names, where) =>
  names.map((name) => ({ name, message: `${name} is not available or not allowed in ${where}.` }));
const viaGlobalThis = (names, where) =>
  names.map((property) => ({
    object: 'globalThis',
    property,
    message: `${property} is not available or not allowed in ${where}.`,
  }));
/** Platform-neutral source: shared by web and mobile, so no browser or Node globals. */
const NEUTRAL_SOURCE = ['packages/shared/*/src/**/*.{ts,tsx}'];
/** Mobile source: React Native has no DOM document or web storage. */
const MOBILE_SOURCE = [
  'packages/mobile/*/src/**/*.{ts,tsx}',
  'apps/mobile/src/**/*.{ts,tsx}',
  'apps/mobile/app/**/*.{ts,tsx}',
];
const MOBILE_BANNED = ['document', 'localStorage', 'sessionStorage', 'indexedDB'];
/**
 * App screens (feature modules and route files) never call the network
 * themselves: API data comes from the resource hooks in
 * @radial-pulse/api-client-react, built on the one API client (ADR 0009).
 */
const WEB_SCREENS = [
  'packages/web/studio-*/src/**/*.{ts,tsx}',
  'apps/web/src/modules/**/*.{ts,tsx}',
  'apps/web/src/routes/**/*.{ts,tsx}',
];
const MOBILE_SCREENS = [
  'packages/mobile/clinic-*/src/**/*.{ts,tsx}',
  'apps/mobile/src/modules/**/*.{ts,tsx}',
  'apps/mobile/app/**/*.{ts,tsx}',
];
const FETCH_MESSAGE =
  'Screens never call fetch: use the resource hooks from @radial-pulse/api-client-react.';
const NO_FETCH_GLOBAL = [{ name: 'fetch', message: FETCH_MESSAGE }];
const NO_FETCH_PROPERTY = ['globalThis', 'window', 'self'].map((object) => ({
  object,
  property: 'fetch',
  message: FETCH_MESSAGE,
}));

// ── File-level import rules inside apps ──────────────────────────────────────
/**
 * Apps never talk HTTP themselves: screens use the resource hooks from
 * @radial-pulse/api-client-react, and only the composition root in
 * @radial-pulse/auth builds the client.
 */
const NO_DIRECT_HTTP = [
  { name: 'openapi-fetch', message: 'Use the resource hooks from @radial-pulse/api-client-react.' },
  {
    name: '@radial-pulse/api-client',
    importNames: ['createApiClient', 'platformMiddleware'],
    message: 'The API client is built once by createAppServices (@radial-pulse/auth).',
  },
  {
    name: '@radial-pulse/api-client-react',
    importNames: ['useApiClient'],
    message: 'Use a resource hook instead; add one to @radial-pulse/api-client-react if missing.',
  },
];
/** Contract mocks and MSW: only an app's mocking module and tests may import them. */
const NO_MOCKS = {
  paths: [
    {
      name: '@radial-pulse/api-mocks',
      message: 'Mocks are dev/test only: import them from the app mocking module or a test.',
    },
  ],
  patterns: [
    {
      group: NO_MSW,
      message: 'MSW is dev/test only: use it from the app mocking module or a test.',
    },
  ],
};
const NATIVE_IN_WEB = {
  group: NATIVE_PACKAGES,
  message: 'Studio is web: native (React Native/Expo) code cannot be used here.',
};
const DOM_IN_MOBILE = {
  group: DOM_PACKAGES,
  message: 'Clinic is native: web (DOM) code cannot be used here.',
};

const TS = '**/*.{ts,tsx}';
const TESTS = ['**/*.test.{ts,tsx}'];
/** Modules that start the contract mocks (loaded only when apiMocking is on). */
const MOCKING_MODULES = ['apps/web/src/app/mocking.ts', 'apps/mobile/src/shell/mocking.ts'];

/**
 * One no-restricted-imports entry per app file group (a later flat-config
 * block replaces the rule, so mocking modules and tests get their own block
 * with the same rules minus the mocks fence).
 */
function appImportBlocks() {
  const block = (files, ignores, platform, mocks) => ({
    files,
    ignores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...NO_DIRECT_HTTP, ...(mocks ? NO_MOCKS.paths : [])],
          patterns: [platform, ...(mocks ? NO_MOCKS.patterns : [])],
        },
      ],
    },
  });
  const allowed = (app) => [
    ...MOCKING_MODULES.filter((f) => f.startsWith(`apps/${app}/`)),
    ...TESTS.map((t) => `apps/${app}/${t}`),
  ];
  return [
    block([`apps/web/${TS}`], allowed('web'), NATIVE_IN_WEB, true),
    block(allowed('web'), [], NATIVE_IN_WEB, false),
    block([`apps/mobile/${TS}`], allowed('mobile'), DOM_IN_MOBILE, true),
    block(allowed('mobile'), [], DOM_IN_MOBILE, false),
  ];
}

const envAccessMessage =
  'Read configuration through useConfig()/the app config module, never from env directly.';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/routeTree.gen.ts',
      'packages/shared/types/src/contract/generated.ts',
      'apps/mobile/ios/**',
      'apps/mobile/android/**',
      'apps/web/public/mockServiceWorker.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { '@nx': nx, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        { enforceBuildableLibDependency: false, allow: [], depConstraints },
      ],
    },
  },

  // JavaScript files are build tooling (configs, scripts): Node globals only.
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },

  // Metro (Expo) loads its config as CommonJS.
  {
    files: ['apps/mobile/metro.config.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  // ── Environment access: only the app config modules may read env ──────────
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    ignores: [
      'apps/web/src/lib/config.ts',
      'apps/mobile/src/lib/config.ts',
      'apps/mobile/app.config.ts',
      '**/*.config.{ts,mjs,js}',
      '**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.meta.name='import'][property.name='env']",
          message: envAccessMessage,
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: envAccessMessage,
        },
      ],
    },
  },

  // ── Import restrictions inside apps ────────────────────────────────────────
  // Between projects, @nx/enforce-module-boundaries above is the rule. Deep
  // imports into packages are impossible: each package.json "exports" map
  // exposes only its entry points.
  ...appImportBlocks(),

  // Libraries never import an app. Nx cannot resolve the app package names
  // (they have no entry point), so its tag rules do not see these imports.
  {
    files: ['packages/*/*/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@radial-pulse/web',
                '@radial-pulse/web/*',
                '@radial-pulse/mobile',
                '@radial-pulse/mobile/*',
              ],
              message: 'Libraries never import apps.',
            },
          ],
        },
      ],
    },
  },

  // Feature libraries and kits: like screens in the apps, they never build or
  // reach the raw API client (repeats the app ban: one rule value per file).
  {
    files: ['packages/web/studio-*/**/*.{ts,tsx}', 'packages/mobile/clinic-*/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: NO_DIRECT_HTTP,
          patterns: [
            {
              group: [
                '@radial-pulse/web',
                '@radial-pulse/web/*',
                '@radial-pulse/mobile',
                '@radial-pulse/mobile/*',
              ],
              message: 'Libraries never import apps.',
            },
          ],
        },
      ],
    },
  },

  // Legacy guard: features are libraries now (ADR 0010); if a feature folder
  // reappears inside an app, its folders still may not import each other.
  {
    files: [`apps/web/src/modules/${TS}`, `apps/mobile/src/modules/${TS}`],
    plugins: { local },
    rules: {
      'local/feature-boundaries': [
        'error',
        { roots: ['apps/web/src/modules', 'apps/mobile/src/modules'] },
      ],
    },
  },

  // ── Platform globals ───────────────────────────────────────────────────────
  {
    files: NEUTRAL_SOURCE,
    ignores: TESTS,
    rules: {
      'no-restricted-globals': [
        'error',
        ...restrictedGlobals([...BROWSER_GLOBALS, ...NODE_GLOBALS], 'platform-neutral code'),
      ],
      'no-restricted-properties': [
        'error',
        ...viaGlobalThis([...BROWSER_GLOBALS, ...NODE_GLOBALS], 'platform-neutral code'),
      ],
    },
  },
  {
    files: MOBILE_SOURCE,
    ignores: [...TESTS, ...MOBILE_SCREENS],
    rules: {
      'no-restricted-globals': ['error', ...restrictedGlobals(MOBILE_BANNED, 'mobile code')],
      'no-restricted-properties': ['error', ...viaGlobalThis(MOBILE_BANNED, 'mobile code')],
    },
  },

  // ── No raw fetch in app screens ────────────────────────────────────────────
  // Mobile screens keep the mobile bans above (one rule value per file).
  {
    files: MOBILE_SCREENS,
    ignores: TESTS,
    rules: {
      'no-restricted-globals': [
        'error',
        ...restrictedGlobals(MOBILE_BANNED, 'mobile code'),
        ...NO_FETCH_GLOBAL,
      ],
      'no-restricted-properties': [
        'error',
        ...viaGlobalThis(MOBILE_BANNED, 'mobile code'),
        ...NO_FETCH_PROPERTY,
      ],
    },
  },
  {
    files: WEB_SCREENS,
    ignores: TESTS,
    rules: {
      'no-restricted-globals': ['error', ...NO_FETCH_GLOBAL],
      'no-restricted-properties': ['error', ...NO_FETCH_PROPERTY],
    },
  },
);
