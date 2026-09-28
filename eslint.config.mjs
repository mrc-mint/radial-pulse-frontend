// Root flat config. Every project runs `eslint .` and inherits this file.
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Dependency rules (docs/architecture.md §3). Tags live in each project's
 * package.json under "nx.tags".
 */
const depConstraints = [
  {
    sourceTag: 'type:app',
    onlyDependOnLibsWithTags: [
      'type:shell',
      'type:ui',
      'type:data-access',
      'type:config',
      'type:util',
      'type:types',
      'type:tokens',
    ],
  },
  {
    sourceTag: 'type:shell',
    onlyDependOnLibsWithTags: [
      'type:ui',
      'type:data-access',
      'type:config',
      'type:util',
      'type:types',
      'type:tokens',
    ],
  },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:tokens', 'type:types', 'type:util'] },
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: ['type:types', 'type:config', 'type:util'],
  },
  { sourceTag: 'type:config', onlyDependOnLibsWithTags: ['type:types'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:types'] },
  { sourceTag: 'type:types', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'type:tokens', onlyDependOnLibsWithTags: [] },
];

const NATIVE = {
  group: ['@radial-pulse/*/native', 'react-native', 'react-native/*', 'expo', 'expo-*'],
  message: 'Native code cannot be used here (web/DOM context).',
};
const DOM = {
  group: ['@radial-pulse/*/web', 'react-dom', 'react-dom/*'],
  message: 'Web (DOM) code cannot be used here (native context).',
};
const NEUTRAL = {
  group: ['react-dom', 'react-dom/*', 'react-native', 'react-native/*', 'expo', 'expo-*'],
  message: 'Shared by web and mobile: keep it free of DOM and native imports.',
};
const NO_APPS = { group: ['**/apps/**'], message: 'Packages must never import from apps.' };
const NO_CROSS_MODULE = {
  group: ['**/modules/**'],
  message: 'Modules are independent: navigate via typed routes, share via packages.',
};

const restrict = (files, patterns, ignores = []) => ({
  files,
  ignores,
  rules: { 'no-restricted-imports': ['error', { patterns }] },
});

function importRestrictionBlocks() {
  const ts = '**/*.{ts,tsx}';
  return [
    restrict([`apps/web/${ts}`], [NATIVE], [`apps/web/src/modules/${ts}`]),
    restrict([`apps/web/src/modules/${ts}`], [NATIVE, NO_CROSS_MODULE]),
    restrict([`apps/mobile/${ts}`], [DOM], [`apps/mobile/src/modules/${ts}`]),
    restrict([`apps/mobile/src/modules/${ts}`], [DOM, NO_CROSS_MODULE]),
    restrict(
      [
        `packages/shared-types/${ts}`,
        `packages/utils/${ts}`,
        `packages/config/${ts}`,
        `packages/api-client/${ts}`,
        `packages/design-tokens/${ts}`,
        `packages/ui/src/shared/${ts}`,
        `packages/platform-shell/src/core/${ts}`,
      ],
      [NEUTRAL, NO_APPS],
    ),
    restrict(
      [`packages/ui/src/web/${ts}`, `packages/platform-shell/src/web/${ts}`],
      [NATIVE, NO_APPS],
    ),
    restrict(
      [`packages/ui/src/native/${ts}`, `packages/platform-shell/src/native/${ts}`],
      [DOM, NO_APPS],
    ),
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
      'packages/shared-types/src/contract/generated.ts',
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
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        { enforceBuildableLibDependency: false, allow: [], depConstraints },
      ],
    },
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

  // ── Import restrictions ────────────────────────────────────────────────────
  // Flat config REPLACES a rule when a later block sets it again, so every
  // file group gets exactly one no-restricted-imports entry, built from the
  // pattern sets below. Deep imports into packages (e.g. shared-types/src/...)
  // are already impossible: each package.json "exports" map exposes only its
  // entry points.
  ...importRestrictionBlocks(),
);
