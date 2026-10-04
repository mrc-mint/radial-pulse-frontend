/**
 * Services: one function per contract operation the frontend uses. Paths,
 * parameters, bodies and results are all typed by the generated contract
 * (`paths`); nothing here declares a domain type of its own.
 */
export type { BodyOf, QueryOf } from './types';
export * from './auth';
export * from './dashboard';
export * from './clinics';
export * from './users';
export * from './presence';
export * from './assessments';
export * from './work-items';
export * from './connections';
export * from './chat';
export * from './assets';
export * from './approvals';
export * from './settings';
