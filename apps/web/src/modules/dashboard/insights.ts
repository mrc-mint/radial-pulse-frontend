import type { Schema } from '@radial-pulse/shared-types';
import { CLINIC_STAGE_LABELS } from '@radial-pulse/utils';

type Clinic = Schema<'ClinicListItem'>;

/**
 * Dashboard feed and highlights, built only from `ClinicListItem` fields
 * (`created_at`, `stage`, `stage_changed_at`, `website_url`) and page totals.
 * Counts and dates only: nothing is scored. Other events and figures in the
 * design (enrichment, assignment, reports, profile coverage) are not in the
 * contract and are not shown (docs/phase-4-contract-dependency.md, gap 18).
 */

export interface ActivityEvent {
  id: string;
  clinicId: string;
  kind: 'added' | 'stage';
  stage: Schema<'ClinicStage'>;
  text: string;
  at: string;
}

/** A stage set within a minute of creation is the starting stage, not a move. */
const STARTING_STAGE_MS = 60_000;

/** Newest clinic events first: clinics added and stage moves. */
export function clinicActivity(clinics: ReadonlyArray<Clinic>, limit = 5): ActivityEvent[] {
  const events = clinics.flatMap((c): ActivityEvent[] => {
    const added: ActivityEvent = {
      id: `${c.id}:added`,
      clinicId: c.id,
      kind: 'added',
      stage: c.stage,
      text: `${c.name} added`,
      at: c.created_at,
    };
    const moved = Date.parse(c.stage_changed_at) - Date.parse(c.created_at) > STARTING_STAGE_MS;
    return moved
      ? [
          added,
          {
            id: `${c.id}:stage`,
            clinicId: c.id,
            kind: 'stage',
            stage: c.stage,
            text: `${c.name} moved to ${CLINIC_STAGE_LABELS[c.stage]}`,
            at: c.stage_changed_at,
          },
        ]
      : [added];
  });
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Clinics created in the same calendar month as `now` (the viewer's calendar). */
export function addedThisMonth(clinics: ReadonlyArray<Clinic>, now = new Date()): number {
  return clinics.filter((c) => {
    const created = new Date(c.created_at);
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;
}

/**
 * Share of clinics with a website, only when every clinic of the list is
 * loaded (`total` is the API's count); otherwise null, never a partial figure.
 */
export function websiteShare(
  clinics: ReadonlyArray<Clinic>,
  total: number,
): { withWebsite: number; total: number; percent: number } | null {
  if (total === 0 || clinics.length < total) return null;
  const withWebsite = clinics.filter((c) => c.website_url).length;
  return { withWebsite, total, percent: Math.round((withWebsite / total) * 100) };
}
