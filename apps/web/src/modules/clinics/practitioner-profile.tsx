import { isApiError } from '@radial-pulse/api-client';
import { useClinicProfile, useUpdateClinicProfile } from '@radial-pulse/api-client/react';
import { useClinicCan } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, Card, Drawer, IconButton, Input } from '@radial-pulse/ui/web';
import {
  emptyService,
  emptyWindow,
  formatClinicAddress,
  formatConsultationFee,
  formatWeeklyHoliday,
  prepareProfileSave,
  profileErrorLabel,
  profileErrorsFromApi,
  profileToDraft,
  scheduleLines,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT_LABELS,
  WEEKDAYS,
  type PractitionerProfileDraft,
  type ProfileErrors,
  type Weekday,
} from '@radial-pulse/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { CardSkeleton, DefinitionList, mutationErrorMessage, QueryError } from '../../app/page-kit';
import './practitioner-profile.css';

type ClinicProfile = Schema<'ClinicProfileRead'>;
type PractitionerProfile = Schema<'PractitionerProfileRead'>;

/** Staff wording for the error summary (the form's own labels). */
const ERROR_LABELS = {
  clinic_name: 'Client organization name',
  clinic_address: 'Address',
};

const number = (value: number | null) => (value === null ? null : value.toLocaleString('en-IN'));

/**
 * Practitioner Profile (`ClinicProfileRead.practitioner_profile`): read-only
 * with `profile:read`; "Edit" (PUT /profile, only changed fields, with the
 * version that was read) with `profile:write`. The API remains the authority.
 */
export function PractitionerProfileCard({ clinicId }: { clinicId: string }) {
  const canRead = useClinicCan(clinicId, 'profile:read');
  const canEdit = useClinicCan(clinicId, 'profile:write');
  const query = useClinicProfile(clinicId, { enabled: canRead });
  const [editing, setEditing] = useState(false);
  if (!canRead) return null;

  const title = 'Practitioner Profile';
  if (query.isError) {
    return (
      <Card title={title}>
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      </Card>
    );
  }
  if (!query.data) return <CardSkeleton lines={8} />;

  return (
    <Card
      title={title}
      description="The client organization’s main practitioner, consultation and practice details"
      actions={
        canEdit ? (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Pencil size={14} />}
            aria-label="Edit Practitioner Profile"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        ) : undefined
      }
    >
      <PractitionerProfileDetails profile={query.data.practitioner_profile} />
      {canEdit && (
        <Drawer
          open={editing}
          onClose={() => setEditing(false)}
          title="Edit Practitioner Profile"
          size="lg"
        >
          {/* Keyed by version: reloading after a conflict starts from the latest profile. */}
          <ProfileForm
            key={query.data.version}
            profile={query.data}
            onDone={() => setEditing(false)}
            onReload={() => void query.refetch()}
          />
        </Drawer>
      )}
    </Card>
  );
}

function PractitionerProfileDetails({ profile }: { profile: PractitionerProfile }) {
  const schedule = profile.consultation_schedule;
  return (
    <div className="rp-stack">
      <ProfileGroup title="Practitioner information">
        <DefinitionList
          items={[
            ['Practitioner full name', profile.full_name],
            ['Specialization', profile.specialization],
            ['Qualifications', profile.qualifications],
            ['Total years of medical experience', number(profile.years_of_experience)],
          ]}
        />
      </ProfileGroup>
      <ProfileGroup title="Client organization information">
        <DefinitionList
          items={[
            ['Client organization name', profile.clinic_name],
            ['Operating since', profile.clinic_operating_since?.toString() ?? null],
            ['Address', formatClinicAddress(profile.clinic_address)],
          ]}
        />
      </ProfileGroup>
      <ProfileGroup title="Consultation information">
        <DefinitionList
          items={[
            [
              'Consultation schedule',
              <ul key="schedule" className="rp-profile-schedule">
                {scheduleLines(schedule, profile.weekly_holiday).map(({ day, label, value }) => (
                  <li key={day}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>,
            ],
            ['Time zone', schedule?.timezone ?? null],
            ['Schedule notes', schedule?.notes ?? null],
            ['Weekly holiday', formatWeeklyHoliday(profile.weekly_holiday)],
            ['Consultation fee', formatConsultationFee(profile.consultation_fee)],
          ]}
        />
      </ProfileGroup>
      <ProfileGroup title="Practice information">
        <DefinitionList
          items={[
            [
              'Main services / conditions treated',
              profile.services.length > 0 ? (
                <ul key="services" className="rp-profile-services">
                  {profile.services.map((s, i) => (
                    <li key={i}>
                      <span className="rp-profile-services__name">{s.name}</span>
                      {s.category && <span className="rp-muted"> · {s.category}</span>}
                      {s.description && <span className="rp-small rp-muted">{s.description}</span>}
                    </li>
                  ))}
                </ul>
              ) : null,
            ],
            ['Approximate patients treated', number(profile.patients_treated)],
            ['Professional highlights', profile.professional_highlights],
          ]}
        />
      </ProfileGroup>
    </div>
  );
}

function ProfileGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rp-profile-group">
      <h3 className="rp-profile-group__title">{title}</h3>
      {children}
    </section>
  );
}

function ProfileForm({
  profile,
  onDone,
  onReload,
}: {
  profile: ClinicProfile;
  onDone: () => void;
  onReload: () => void;
}) {
  const current = profile.practitioner_profile;
  const [draft, setDraft] = useState(() => profileToDraft(current));
  const [localErrors, setLocalErrors] = useState<ProfileErrors>({});
  const update = useUpdateClinicProfile(profile.clinic_id);
  const apiError = isApiError(update.error) ? update.error : null;
  const apiErrors = profileErrorsFromApi(apiError?.fieldErrors);
  const errors: ProfileErrors = { ...apiErrors, ...localErrors };
  const err = (key: string) => errors[key];
  const formId = useId();

  const edit = (change: (d: PractitionerProfileDraft) => PractitionerProfileDraft) =>
    setDraft((d) => change(d));
  const setField = <K extends keyof PractitionerProfileDraft>(
    key: K,
    value: PractitionerProfileDraft[K],
  ) => edit((d) => ({ ...d, [key]: value }));
  const setAddress = (key: keyof PractitionerProfileDraft['address'], value: string) =>
    edit((d) => ({ ...d, address: { ...d.address, [key]: value } }));
  const setDay = (day: Weekday, windows: PractitionerProfileDraft['days'][Weekday]) =>
    edit((d) => ({ ...d, days: { ...d.days, [day]: windows } }));
  const setService = (i: number, key: 'name' | 'category' | 'description', value: string) =>
    edit((d) => ({
      ...d,
      services: d.services.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const { errors: found, patch } = prepareProfileSave(current, draft);
    setLocalErrors(found);
    if (Object.keys(found).length > 0) return;
    if (Object.keys(patch).length === 0) return onDone();
    update.mutate({ version: profile.version, practitioner_profile: patch }, { onSuccess: onDone });
  }

  function reload() {
    const ok = window.confirm(
      'Reload the latest Practitioner Profile?\n\nYour unsaved changes in this form will be discarded.',
    );
    if (ok) onReload();
  }

  const errorList = Object.entries(errors);
  const general =
    update.isError && Object.keys(apiErrors).length === 0 && apiError?.kind !== 'conflict'
      ? mutationErrorMessage(update.error)
      : null;

  return (
    <form id={formId} className="rp-form" onSubmit={submit} noValidate>
      <fieldset className="rp-profile-fieldset">
        <legend>Practitioner information</legend>
        <div className="rp-form__grid">
          <Input
            label="Practitioner full name"
            value={draft.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            error={err('full_name')}
            required={current.practitioner_id !== null}
          />
          <Input
            label="Specialization"
            value={draft.specialization}
            onChange={(e) => setField('specialization', e.target.value)}
            error={err('specialization')}
          />
          <Input
            label="Qualifications"
            hint="For example: BDS, MDS"
            value={draft.qualifications}
            onChange={(e) => setField('qualifications', e.target.value)}
            error={err('qualifications')}
          />
          <Input
            label="Total years of medical experience"
            inputMode="numeric"
            value={draft.years_of_experience}
            onChange={(e) => setField('years_of_experience', e.target.value)}
            error={err('years_of_experience')}
          />
        </div>
      </fieldset>

      <fieldset className="rp-profile-fieldset">
        <legend>Client organization information</legend>
        <div className="rp-form__grid">
          <Input
            label="Client organization name"
            value={draft.clinic_name}
            onChange={(e) => setField('clinic_name', e.target.value)}
            error={err('clinic_name')}
            required
          />
          <Input
            label="Operating since"
            hint="The year it opened"
            inputMode="numeric"
            value={draft.clinic_operating_since}
            onChange={(e) => setField('clinic_operating_since', e.target.value)}
            error={err('clinic_operating_since')}
          />
          <Input
            label="Address"
            value={draft.address.address_line}
            onChange={(e) => setAddress('address_line', e.target.value)}
            error={err('clinic_address.address_line') ?? err('clinic_address')}
          />
          <Input
            label="City"
            value={draft.address.city}
            onChange={(e) => setAddress('city', e.target.value)}
            error={err('clinic_address.city')}
          />
          <Input
            label="State"
            value={draft.address.state}
            onChange={(e) => setAddress('state', e.target.value)}
            error={err('clinic_address.state')}
          />
          <Input
            label="Postal code"
            value={draft.address.postal_code}
            onChange={(e) => setAddress('postal_code', e.target.value)}
            error={err('clinic_address.postal_code')}
          />
          <Input
            label="Country code"
            hint="Two letters, e.g. IN"
            maxLength={2}
            value={draft.address.country}
            onChange={(e) => setAddress('country', e.target.value)}
            error={err('clinic_address.country')}
          />
        </div>
      </fieldset>

      <fieldset className="rp-profile-fieldset">
        <legend>Consultation information</legend>
        <p className="rp-small rp-muted">
          Consultation schedule: 24-hour times, e.g. 09:30 to 13:00. Add several windows for split
          hours.
        </p>
        {WEEKDAYS.map((day) => {
          const name = WEEKDAY_LABELS[day];
          const windows = draft.days[day];
          return (
            <div key={day} className="rp-profile-day">
              <div className="rp-row rp-row--between">
                <strong>{name}</strong>
                {windows.length === 0 && (
                  <span className="rp-small rp-muted">
                    {draft.weekly_holiday.includes(day) ? 'Weekly holiday' : 'No consultation'}
                  </span>
                )}
              </div>
              {windows.map((w, i) => (
                <div key={i} className="rp-profile-window">
                  <Input
                    label={`${name} window ${i + 1} opens`}
                    hideLabel
                    type="time"
                    value={w.opens}
                    onChange={(e) =>
                      setDay(
                        day,
                        windows.map((x, j) => (j === i ? { ...x, opens: e.target.value } : x)),
                      )
                    }
                    error={err(`consultation_schedule.days.${day}.${i}`)}
                  />
                  <span className="rp-muted" aria-hidden="true">
                    to
                  </span>
                  <Input
                    label={`${name} window ${i + 1} closes`}
                    hideLabel
                    type="time"
                    value={w.closes}
                    onChange={(e) =>
                      setDay(
                        day,
                        windows.map((x, j) => (j === i ? { ...x, closes: e.target.value } : x)),
                      )
                    }
                  />
                  <IconButton
                    icon={<Trash2 size={16} />}
                    label={`Remove ${name} window ${i + 1}`}
                    onClick={() =>
                      setDay(
                        day,
                        windows.filter((_, j) => j !== i),
                      )
                    }
                  />
                </div>
              ))}
              {err(`consultation_schedule.days.${day}`) && (
                <p className="rp-form__error">{err(`consultation_schedule.days.${day}`)}</p>
              )}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon={<Plus size={14} />}
                  aria-label={`Add ${name} consultation window`}
                  onClick={() => setDay(day, [...windows, emptyWindow()])}
                >
                  Add window
                </Button>
              </div>
            </div>
          );
        })}
        <div className="rp-form__grid">
          <Input
            label="Time zone"
            value={draft.timezone}
            onChange={(e) => setField('timezone', e.target.value)}
            error={err('consultation_schedule.timezone')}
          />
          <Input
            label="Schedule notes"
            value={draft.schedule_notes}
            onChange={(e) => setField('schedule_notes', e.target.value)}
            error={err('consultation_schedule.notes') ?? err('consultation_schedule')}
          />
        </div>
        <div role="group" aria-label="Weekly holiday" className="rp-stack-sm">
          <span className="rp-field__label">Weekly holiday / non-consultation day</span>
          <div className="rp-row">
            {WEEKDAYS.map((day) => (
              <label key={day} className="rp-profile-check">
                <input
                  type="checkbox"
                  checked={draft.weekly_holiday.includes(day)}
                  aria-label={`${WEEKDAY_LABELS[day]} weekly holiday`}
                  onChange={(e) =>
                    setField(
                      'weekly_holiday',
                      e.target.checked
                        ? [...draft.weekly_holiday, day]
                        : draft.weekly_holiday.filter((d) => d !== day),
                    )
                  }
                />
                {WEEKDAY_SHORT_LABELS[day]}
              </label>
            ))}
          </div>
          {err('weekly_holiday') && <p className="rp-form__error">{err('weekly_holiday')}</p>}
        </div>
        <Input
          label="Consultation fee"
          hint={`Amount in ${draft.fee_currency}. Leave empty if not shown.`}
          inputMode="decimal"
          leading={draft.fee_currency}
          value={draft.fee_amount}
          onChange={(e) => setField('fee_amount', e.target.value)}
          error={
            err('consultation_fee.amount_minor') ??
            err('consultation_fee.currency') ??
            err('consultation_fee')
          }
        />
      </fieldset>

      <fieldset className="rp-profile-fieldset">
        <legend>Practice information</legend>
        <span className="rp-field__label">Main services / conditions treated</span>
        {err('services') && <p className="rp-form__error">{err('services')}</p>}
        {draft.services.map((s, i) => (
          <div key={i} className="rp-profile-service">
            <Input
              label={`Service ${i + 1} name`}
              value={s.name}
              onChange={(e) => setService(i, 'name', e.target.value)}
              error={err(`services.${i}.name`) ?? err(`services.${i}`)}
              required
            />
            <Input
              label="Category"
              value={s.category}
              onChange={(e) => setService(i, 'category', e.target.value)}
              error={err(`services.${i}.category`)}
            />
            <Input
              label="Description"
              value={s.description}
              onChange={(e) => setService(i, 'description', e.target.value)}
              error={err(`services.${i}.description`)}
            />
            <IconButton
              icon={<Trash2 size={16} />}
              label={`Remove service ${i + 1}`}
              onClick={() =>
                edit((d) => ({ ...d, services: d.services.filter((_, j) => j !== i) }))
              }
            />
          </div>
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => edit((d) => ({ ...d, services: [...d.services, emptyService()] }))}
          >
            Add service
          </Button>
        </div>
        <Input
          label="Approximate patients treated"
          inputMode="numeric"
          value={draft.patients_treated}
          onChange={(e) => setField('patients_treated', e.target.value)}
          error={err('patients_treated')}
        />
        <TextArea
          label="Professional highlights"
          value={draft.professional_highlights}
          onChange={(v) => setField('professional_highlights', v)}
          error={err('professional_highlights')}
        />
      </fieldset>

      {apiError?.kind === 'conflict' && (
        <div className="rp-callout rp-callout--warning rp-profile-conflict" role="alert">
          <span>
            Someone else saved this Practitioner Profile while you were editing. Reload the latest
            version, then make your changes again.
          </span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Reload latest profile
          </Button>
        </div>
      )}
      {general && (
        <p className="rp-form__error" role="alert">
          {general}
        </p>
      )}
      {errorList.length > 0 && (
        <div className="rp-form__error" role="alert">
          <p>Check these fields:</p>
          <ul>
            {errorList.map(([key, message]) => (
              <li key={key}>
                {profileErrorLabel(key, ERROR_LABELS)}: {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rp-row">
        <Button type="submit" loading={update.isPending}>
          Save changes
        </Button>
        <Button variant="secondary" disabled={update.isPending} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="rp-field">
      <label htmlFor={id} className="rp-field__label">
        {label}
      </label>
      <textarea
        id={id}
        className="rp-profile-textarea"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="rp-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
