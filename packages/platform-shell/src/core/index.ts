export type {
  ClinicSectionEntry,
  ModuleManifest,
  NavEntry,
  NavIcon,
  NavPlacement,
  ResolvedClinicSection,
  ResolvedNavEntry,
} from './manifest';
export { isRouteActive, resolveClinicSections, resolveNavigation } from './navigation';

export type {
  ClinicSummary,
  CurrentUser,
  Session,
  SessionAdapter,
  SessionController,
  SessionState,
  SignInOption,
  Tenant,
} from './session';
export { createSessionController } from './session';
export {
  Can,
  SessionProvider,
  useCan,
  useCapabilities,
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
export { ROLE_LABELS, roleLabel } from './roles';
