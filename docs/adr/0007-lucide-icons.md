# 0007 — Lucide for icons

Status: accepted (platform shell phase)

Web uses `lucide-react` everywhere: navigation, `@radial-pulse/ui` primitives
and pages. No hand-drawn icon sets. The brand mark is the only custom SVG.

Platform-neutral code (module manifests in `platform-shell/core`) names icons
(`NavIcon`: `'dashboard'`, `'clinics'`, …) instead of importing components;
each platform shell maps names to its own icon set.

Native will use `lucide-react-native` (same icon names and visual language),
which requires `react-native-svg` installed with `expo install`. Added in the
mobile phase; until then the native primitives use a few text glyphs.
