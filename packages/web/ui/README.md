# @radial-pulse/web-ui

Studio (web) design-system components: the DOM implementation of the prop
contracts in `@radial-pulse/ui-shared`. Components receive data and never
fetch. Tags: `type:ui`, `platform:web`. The React Native counterpart is
`@radial-pulse/mobile-ui`.

The entry re-exports the shared contracts, tones and display helpers, so Studio
imports everything UI-related from `@radial-pulse/web-ui`.

## Layers

Each layer may use the ones above it, never the ones below.

| Layer              | Where                                                         | Examples                                                                   |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Design tokens      | `@radial-pulse/design-tokens`                                 | colours, spacing, radii, type scale, chart colours                         |
| Primitives         | `web-ui` / `mobile-ui`                                        | Button, IconButton, Input, Select, Card, Badge, Avatar                     |
| Components         | `web-ui` / `mobile-ui`                                        | Table, Tabs, Modal, MetricCard, ScoreCard, FindingCard, EmptyState, charts |
| App patterns       | `apps/web/src/app` (Studio), `apps/mobile/src/shell` (Clinic) | page kit (QueryError, DefinitionList), clinic photo, assessment kit        |
| Feature components | `apps/*/src/modules/<feature>`                                | clinic header, attention list, assessment view                             |
| Pages              | `apps/*/src/modules/<feature>`, routes                        | clinic overview, dashboard                                                 |

## Rules

- Generic only: a component here knows no feature or screen. If it needs a
  feature name, it belongs in the app (`app/` or the module).
- Contract enums are shown through the tone maps in `ui-shared` (`tones.ts`, and
  labels in `@radial-pulse/utils`), typed `Record<ContractEnum, …>` so a new
  value is a compile error.
- Values are shown as the API sent them. A missing score reads its status
  ("Not Available"), never 0.
- Every component that shows data has a matching loading, empty and error
  presentation (`Skeleton`, `EmptyState`, `ErrorState`).

## Web: shadcn + React Aria

Interactive web components follow the shadcn pattern, with React Aria
Components (RAC) instead of Radix:

| Responsibility     | Where                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| Behaviour and a11y | `react-aria-components` (keyboard, focus, ARIA, overlays). One library per interaction |
| Styling            | Tailwind classes, variants with `class-variance-authority`, merged with `cn()`         |
| Theme              | `src/tailwind.css`: shadcn/Tailwind names mapped onto `--rp-*` token variables         |

| Component          | Implementation                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, IconButton | RAC `Button` + cva (`buttonClassName` still styles router links)                                                                                          |
| Modal, Drawer      | RAC `ModalOverlay` / `Modal` / `Dialog` / `Heading`                                                                                                       |
| Select             | RAC `Select` / `ListBox` / `Popover` (hidden native select for forms)                                                                                     |
| Tabs               | With `children`: RAC `Tabs` / `TabList` / `Tab` / `TabPanel`. Filter-only (no children): RAC `RadioGroup` / `Radio`, so nothing points at a missing panel |
| DropdownMenu       | RAC `MenuTrigger` / `Menu` / `MenuItem` / `Popover`                                                                                                       |
| Input, SearchInput | Native `<input>` (no RAC needed), Tailwind styling; RAC clear button                                                                                      |
| Everything else    | Plain CSS over tokens (presentational, no interaction to migrate)                                                                                         |

Rules:

- Public props stay platform-neutral (`ui-shared` `contracts.ts`); RAC props are
  an implementation detail. Keep the existing API when migrating.
- Tailwind runs without preflight and only scans this package
  (`source(none)` + `@source`). Apps and feature modules do not use Tailwind
  classes; they use these components.
- Colours, spacing, radii, shadows and type come from tokens via the theme.
  No literal colours (`styles.test.ts`).
- `components.json` configures the shadcn CLI for this package. Its default
  registry generates **Radix** components: do not add them as-is. Use a
  generated file only as a styling reference, rebuild its behaviour on RAC,
  and use relative imports (the `@/` alias exists for the CLI only).
- The `rp-field*` classes (label, hint, error) stay CSS: app forms reuse them.
- Native components live in `@radial-pulse/mobile-ui` (Clinic, V2).
