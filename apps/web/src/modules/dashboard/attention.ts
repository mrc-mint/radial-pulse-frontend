import type { Schema } from '@radial-pulse/shared-types';

type Clinic = Schema<'ClinicListItem'>;

export interface ClinicSignals {
  clinic: Clinic;
  /** Assessments of this clinic (newest first), when loaded. */
  assessments?: ReadonlyArray<Schema<'AssessmentRead'>>;
  /** Presence profiles of this clinic, when loaded. */
  profiles?: ReadonlyArray<Schema<'PresenceProfileRead'>>;
  /** This clinic's chat thread from the inbox, if any. */
  thread?: Schema<'ChatThread'>;
}

export interface AttentionItem {
  clinic: Clinic;
  reasons: string[];
  /** When the newest reason happened (for ordering and "2 hours ago"). */
  at: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * What a Digital Success Manager should look at, per clinic, from contract
 * data only: an assessment submitted for review, a clinic reply waiting in
 * chat, discovered profiles still to confirm, and open work items. Clinics
 * with nothing waiting are left out; the rest are newest first.
 */
export function clinicsNeedingAttention(
  rows: ReadonlyArray<ClinicSignals>,
  limit = 5,
): AttentionItem[] {
  const items = rows.flatMap(({ clinic, assessments, profiles, thread }): AttentionItem[] => {
    const reasons: string[] = [];
    const times: string[] = [];

    const review = assessments?.find((a) => a.approval_state === 'submitted');
    if (review) {
      reasons.push('Audit ready for review');
      times.push(review.completed_at ?? review.created_at);
    }
    if (thread && thread.unread_count > 0) {
      reasons.push(
        thread.last_message.sender_side === 'clinic' ? 'Client replied in chat' : 'Unread chat',
      );
      times.push(thread.last_message.created_at);
    }
    const unverified = (profiles ?? []).filter((p) => p.verification === 'unverified');
    if (unverified.length > 0) {
      reasons.push(plural(unverified.length, 'profile to review', 'profiles to review'));
      times.push(
        unverified
          .map((p) => p.created_at)
          .sort()
          .at(-1)!,
      );
    }
    const open = clinic.open_work.reduce((n, a) => n + a.open_count, 0);
    if (open > 0) {
      reasons.push(plural(open, 'open work item', 'open work items'));
      times.push(clinic.updated_at);
    }

    return reasons.length === 0 ? [] : [{ clinic, reasons, at: times.sort().at(-1)! }];
  });
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
