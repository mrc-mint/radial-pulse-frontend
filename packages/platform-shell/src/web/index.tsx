/**
 * @radial-pulse/platform-shell/web — the web layouts (architecture §4):
 * app shell, clinic workspace frame and shell-level states. Router-agnostic:
 * the app supplies the pathname and a `renderLink` bound to its router.
 * Requires @radial-pulse/design-tokens/css to be loaded by the app.
 */
export { WebAppShell } from './app-shell';
export type { ShellUser, WebAppShellProps } from './app-shell';
export { ClinicWorkspace } from './clinic-workspace';
export type { ClinicWorkspaceProps } from './clinic-workspace';
export { AuthLayout } from './auth-layout';
export { Brand, BrandMark } from './brand';
export type { RenderLink, ShellLinkProps } from './link';
export { NAV_ICONS } from './nav-icons';
export {
  AccessDenied,
  FullPageError,
  FullPageLoading,
  FullPageStatus,
  NotFound,
  RequireCapability,
} from './states';
