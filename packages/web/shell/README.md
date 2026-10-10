# @radial-pulse/web-shell

Studio's (web) app frame, router-agnostic: the app shell (sidebar at 1024 px and
up, icon rail 768–1023 px, drawer below), the clinic workspace frame, full-page
states and the brand. The app supplies the pathname and a `renderLink` bound to
its router. Requires `@radial-pulse/design-tokens/css` loaded by the app.
Tags: `type:shell`, `platform:web`.

Builds on `@radial-pulse/shell-core` (navigation, permissions) and
`@radial-pulse/web-ui`. No feature content, no API calls.
