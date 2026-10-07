import { usePlatformSettings, useUpdatePlatformSettings } from '@radial-pulse/api-client/react';
import { roleLabel, useCan, useCurrentSession } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import { Avatar, Button, Card, Input, PageHeader, Select } from '@radial-pulse/ui/web';
import { useState, type FormEvent } from 'react';
import {
  CardSkeleton,
  DefinitionList,
  fieldErrors,
  mutationErrorMessage,
  QueryError,
} from '../../app/page-kit';

type Settings = Schema<'PlatformSettingsRead'>;
type DateFormat = Schema<'DateFormat'>;

/** Contract `DateFormat` values with an example; the value itself is the format. */
const DATE_FORMATS: Record<DateFormat, string> = {
  'DD MMM YYYY': 'DD MMM YYYY (12 Sep 2026)',
  'DD/MM/YYYY': 'DD/MM/YYYY (12/09/2026)',
  'YYYY-MM-DD': 'YYYY-MM-DD (2026-09-12)',
};

function timeZones(current: string): string[] {
  const all =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return all.includes(current) ? all : [current, ...all];
}

/**
 * Settings (V1): your profile for everyone, and the platform's General
 * settings for users with `settings:manage`.
 */
export function SettingsPage() {
  const canManage = useCan('settings:manage');
  return (
    <div className="rp-page">
      <PageHeader title="Settings" description="Your profile and platform preferences" />
      <div className="rp-grid rp-grid--main-aside">
        <div className="rp-stack">{canManage ? <GeneralSettings /> : <ProfileCard />}</div>
        <div className="rp-stack">{canManage && <ProfileCard />}</div>
      </div>
    </div>
  );
}

function ProfileCard() {
  const { user } = useCurrentSession();
  return (
    <Card title="Your profile">
      <span className="rp-person">
        <Avatar name={user.name} src={user.avatarUrl} size="lg" decorative />
        <span className="rp-cell-title">
          <span>{user.name}</span>
          <span>{roleLabel(user.platformRole)}</span>
        </span>
      </span>
      <DefinitionList
        items={[
          ['Email', user.email],
          ['Sign-in', 'Email and password'],
        ]}
      />
    </Card>
  );
}

function GeneralSettings() {
  const settings = usePlatformSettings();
  if (settings.isError) {
    return (
      <Card title="General">
        <QueryError error={settings.error} onRetry={() => void settings.refetch()} />
      </Card>
    );
  }
  if (!settings.data) return <CardSkeleton lines={5} />;
  // Re-mount the form when the saved values change so it starts from them.
  return <GeneralForm key={settings.data.updated_at ?? 'initial'} settings={settings.data} />;
}

function GeneralForm({ settings }: { settings: Settings }) {
  const update = useUpdatePlatformSettings();
  const [draft, setDraft] = useState({
    organization_name: settings.organization_name,
    support_email: settings.support_email ?? '',
    support_phone: settings.support_phone ?? '',
    timezone: settings.timezone,
    date_format: settings.date_format,
  });
  const errors = fieldErrors(update.error);
  const changed =
    draft.organization_name !== settings.organization_name ||
    draft.support_email !== (settings.support_email ?? '') ||
    draft.support_phone !== (settings.support_phone ?? '') ||
    draft.timezone !== settings.timezone ||
    draft.date_format !== settings.date_format;

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({
      organization_name: draft.organization_name.trim(),
      support_email: draft.support_email.trim() || null,
      support_phone: draft.support_phone.trim() || null,
      timezone: draft.timezone,
      date_format: draft.date_format,
    });
  }

  const generalError =
    update.isError && Object.keys(errors).length === 0 ? mutationErrorMessage(update.error) : null;

  return (
    <Card title="General" description="Basic platform settings">
      <form className="rp-form" onSubmit={submit} noValidate>
        <Input
          label="Organization name"
          required
          value={draft.organization_name}
          onChange={(e) => setDraft((d) => ({ ...d, organization_name: e.target.value }))}
          error={errors.organization_name?.[0]}
        />
        <div className="rp-form__grid">
          <Input
            label="Support email"
            type="email"
            value={draft.support_email}
            onChange={(e) => setDraft((d) => ({ ...d, support_email: e.target.value }))}
            error={errors.support_email?.[0]}
          />
          <Input
            label="Support phone"
            type="tel"
            value={draft.support_phone}
            onChange={(e) => setDraft((d) => ({ ...d, support_phone: e.target.value }))}
            error={errors.support_phone?.[0]}
          />
        </div>
        <div className="rp-form__grid">
          <Select
            label="Timezone"
            value={draft.timezone}
            onChange={(v) => setDraft((d) => ({ ...d, timezone: v }))}
            options={timeZones(settings.timezone).map((tz) => ({ value: tz, label: tz }))}
            error={errors.timezone?.[0]}
          />
          <Select
            label="Date format"
            value={draft.date_format}
            onChange={(v) => setDraft((d) => ({ ...d, date_format: v }))}
            options={(Object.keys(DATE_FORMATS) as DateFormat[]).map((f) => ({
              value: f,
              label: DATE_FORMATS[f],
            }))}
            error={errors.date_format?.[0]}
          />
        </div>
        {generalError && (
          <p className="rp-form__error" role="alert">
            {generalError}
          </p>
        )}
        <div className="rp-row rp-row--between">
          <span className="rp-muted rp-small" role="status">
            {update.isSuccess && !changed ? 'Changes saved.' : ''}
          </span>
          <Button type="submit" loading={update.isPending} disabled={!changed}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
