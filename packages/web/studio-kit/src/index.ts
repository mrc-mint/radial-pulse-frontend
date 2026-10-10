/**
 * @radial-pulse/studio-kit — Studio (web) building blocks shared by Studio
 * feature libraries: the page kit, clinic photo, activity text, release flags
 * and navigation labels. App-specific, feature-free; features never import
 * each other, only this kit and lower libraries.
 */
export * from './page-kit';
export { ClinicPhoto } from './clinic-photo';
export { activityText } from './activity-text';
export { STUDIO_FEATURES } from './release';
export { NavLabelsProvider, useNavLabel } from './nav-labels';
export type { NavLabel } from './nav-labels';
