/**
 * @radial-pulse/shared-types
 *
 * Three layers (docs/architecture.md §9):
 *   contract/  – GENERATED from contracts/api/openapi.json. Never hand-edit.
 *   domain/    – named aliases and narrowings over the contract, plus the
 *                handful of platform rules that must hold on every screen.
 *   (view models live in the apps, not here.)
 *
 * Until the backend publishes its first contract version, domain/ holds only
 * rule-encoding types. Entity types (Clinic, Assessment, Finding, …) are added
 * in Phase 4 as aliases of generated contract schemas — not hand-written.
 */
export type * from './contract';
export type * from './domain';
