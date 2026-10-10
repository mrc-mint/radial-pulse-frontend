# @radial-pulse/mobile-ui

Clinic (mobile, V2) design-system components: the React Native implementation
of the prop contracts in `@radial-pulse/ui-shared`, reading the token object
(Inter, 44 pt touch targets, bottom sheets). Components receive data and never
fetch. Tags: `type:ui`, `platform:mobile`.

The entry re-exports the shared contracts, tones and display helpers, so Clinic
imports everything UI-related from `@radial-pulse/mobile-ui`. Web-only
primitives (Table, Pagination, DropdownMenu, Drawer, SearchInput) have no
native counterpart because no mobile screen needs them.

Rules are the same as `@radial-pulse/web-ui` (generic only, tones for contract
enums, missing values shown as missing, loading/empty/error states). Lint
rejects web packages (`react-dom`, React Aria) and `document` / web storage here.
