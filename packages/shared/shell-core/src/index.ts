/**
 * @radial-pulse/shell-core — platform-neutral React shell: module manifests and
 * navigation, session/permission hooks, clinic context and config context.
 * Shared by @radial-pulse/web-shell and @radial-pulse/mobile-shell.
 */
export type {
  ClinicSectionEntry,
  ModuleManifest,
  NavEntry,
  NavIcon,
  NavPlacement,
  ResolvedClinicSection,
  ResolvedNavEntry,
} from './manifest';
export {
  hasClinicPermission,
  isRouteActive,
  resolveClinicSections,
  resolveNavigation,
} from './navigation';
export type { ClinicPermissionSet } from './navigation';
export {
  Can,
  SessionProvider,
  useCan,
  useCapabilities,
  useClinicCan,
  useClinicPermissions,
  useCurrentSession,
  useSession,
} from './session-context';
export type { UseSession } from './session-context';
export {
  ClinicScopeProvider,
  ClinicSelectionProvider,
  resolveSelectedClinic,
  useClinicId,
  useClinicSelection,
  useOptionalClinicId,
} from './clinic-context';
export type { ClinicSelection } from './clinic-context';
export { ConfigProvider, useConfig } from './config-context';
