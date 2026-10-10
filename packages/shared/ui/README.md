# @radial-pulse/ui-shared

Platform-neutral UI contracts shared by `@radial-pulse/web-ui` (Studio) and
`@radial-pulse/mobile-ui` (Clinic). Tags: `type:ui`, `platform:neutral`.

| File            | Contents                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `contracts.ts`  | Prop contracts both implementations follow (Button, Card, MetricCard, …) |
| `tones.ts`      | Badge tones per contract enum value, typed `Record<ContractEnum, Tone>`  |
| `display.ts`    | Dates, relative time, metric values, initials, avatar tones, hosts       |
| `findings.ts`   | Finding card props and priority sorting                                  |
| `pagination.ts` | Page ranges for paginated tables                                         |

## Belongs here

- Prop contracts and presentation helpers that both platforms use.

## Does not belong here

- Components, DOM or React Native code: those go in `web-ui` / `mobile-ui`.
- Feature names or API calls. Labels for contract enums live in
  `@radial-pulse/utils` (`labels.ts`).

Depends on `utils`, `design-tokens` and `shared-types` only. React is used for
types (`ReactNode`) only. Lint rejects browser and Node globals here.
