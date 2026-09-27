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

export type {
  ClinicPermissions,
  ClinicSummary,
  CurrentUser,
  Session,
  SessionAdapter,
  SessionController,
  SessionState,
  SignInOption,
} from './session';
export { createSessionController, sessionFromMe } from './session';
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
export { roleLabel } from './roles';
export { clinicAdministratorClinicIds, productExperience } from './experience';
export type { ProductExperience } from './experience';
