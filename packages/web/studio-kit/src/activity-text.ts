import type { Schema } from '@radial-pulse/shared-types';
import {
  CLINIC_STAGE_LABELS,
  PRESENCE_PLATFORM_LABELS,
  PRESENCE_VERIFICATION_LABELS,
} from '@radial-pulse/utils';

type AuditEvent = Schema<'AuditEventRead'>;
type Stage = Schema<'ClinicStage'>;
type Platform = Schema<'PresencePlatform'>;

const str = (value: unknown) => (typeof value === 'string' ? value : null);

function platformLabel(value: unknown): string | null {
  const key = str(value);
  return key && key in PRESENCE_PLATFORM_LABELS ? PRESENCE_PLATFORM_LABELS[key as Platform] : key;
}

/**
 * Plain-language line for an audit event. `action` is a backend code
 * (`clinic.stage_change`…) without a published list, so known codes get a
 * sentence and anything else falls back to its resource and verb.
 */
export function activityText(event: AuditEvent, personName: (id: string) => string | null): string {
  const d = event.details;
  switch (event.action) {
    case 'clinic.create':
      return 'Client organization added';
    case 'clinic.update':
      return 'Client organization details updated';
    case 'clinic.stage_change': {
      const to = str(d.to) as Stage | null;
      return to && to in CLINIC_STAGE_LABELS
        ? `Status changed to ${CLINIC_STAGE_LABELS[to]}`
        : 'Status changed';
    }
    case 'clinic.archive':
      return str(d.reason)
        ? `Client organization archived: ${str(d.reason)}`
        : 'Client organization archived';
    case 'clinic.restore':
      return 'Client organization restored';
    case 'assignment.change': {
      const name = str(d.user_id) ? personName(str(d.user_id)!) : null;
      return name ? `Allocated to ${name}’s portfolio` : 'Portfolio allocation changed';
    }
    case 'assignment.end':
      return 'Removed from the portfolio';
    case 'presence_profile.add':
      return `${platformLabel(d.platform) ?? 'Online profile'} added`;
    case 'presence_profile.update': {
      const verification = str(d.verification) as Schema<'PresenceVerification'> | null;
      const label = platformLabel(d.platform) ?? 'Online profile';
      return verification && verification in PRESENCE_VERIFICATION_LABELS
        ? `${label} marked ${PRESENCE_VERIFICATION_LABELS[verification].toLowerCase()}`
        : `${label} updated`;
    }
    case 'assessment.requested':
      return 'Assessment requested';
    case 'assessment.generated':
      return 'Assessment completed';
    case 'connection.start':
      return `${platformLabel(d.platform) ?? 'Account'} connection started`;
    case 'connection.connected':
      return `${platformLabel(d.platform) ?? 'Account'} connected`;
    case 'connection.disconnected':
      return `${platformLabel(d.platform) ?? 'Account'} disconnected`;
    case 'chat.message_sent':
      return 'Chat message sent';
    case 'asset.upload_confirmed':
      return 'File uploaded';
    case 'work_item.create':
      return 'Action added';
    case 'report.create':
      return 'Report added';
    case 'team.add':
      return 'Clinic Team Member added';
    default: {
      const [resource, verb] = event.action.split('.');
      const words = `${(resource ?? event.resource_type).replace(/_/g, ' ')} ${(verb ?? 'updated').replace(/_/g, ' ')}`;
      return words.charAt(0).toUpperCase() + words.slice(1);
    }
  }
}
