# @radial-pulse/ui

Presentational components with separate web and native implementations of
one shared prop contract. Components receive data and never fetch.

| Entry     | Contents                                                                             |
| --------- | ------------------------------------------------------------------------------------ |
| `/shared` | Prop contracts, tone maps for contract enums, display helpers (dates, finding props) |
| `/web`    | DOM components styled with token CSS variables                                       |
| `/native` | React Native components reading the token object (Inter, 44 pt touch targets)        |

## Layers

Each layer may use the ones above it, never the ones below.

| Layer              | Where                                       | Examples                                                                   |
| ------------------ | ------------------------------------------- | -------------------------------------------------------------------------- |
| Design tokens      | `@radial-pulse/design-tokens`               | colours, spacing, radii, type scale, chart colours                         |
| Primitives         | this package                                | Button, IconButton, Input, Select, Card, Badge, Avatar                     |
| Components         | this package                                | Table, Tabs, Modal, MetricCard, ScoreCard, FindingCard, EmptyState, charts |
| App patterns       | `apps/web/src/app`, `apps/mobile/src/shell` | page kit (QueryError, DefinitionList), clinic photo, assessment kit        |
| Feature components | `apps/*/src/modules/<feature>`              | clinic header, attention list, assessment view                             |
| Pages              | `apps/*/src/modules/<feature>`, routes      | clinic overview, dashboard                                                 |

## Rules

- Generic only: a component here knows no feature or screen. If it needs a
  feature name, it belongs in the app (`app/` or the module).
- Contract enums are shown through the tone maps in `/shared/tones.ts` (and
  labels in `@radial-pulse/utils`), typed `Record<ContractEnum, …>` so a new
  value is a compile error.
- Values are shown as the API sent them. A missing score reads its status
  ("Not Available"), never 0.
- Every component that shows data has a matching loading, empty and error
  presentation (`Skeleton`, `EmptyState`, `ErrorState`).
