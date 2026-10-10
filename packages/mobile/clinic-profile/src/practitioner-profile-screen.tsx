import { isApiError } from '@radial-pulse/api-client';
import { useClinicProfile, useUpdateClinicProfile } from '@radial-pulse/api-client-react';
import { tokens as t } from '@radial-pulse/design-tokens';
import { useClinicCan, useClinicId } from '@radial-pulse/shell-core';
import { Screen } from '@radial-pulse/mobile-shell';
import type { Schema } from '@radial-pulse/shared-types';
import { Button, Card, IconButton, Input, fontStyle, textStyle } from '@radial-pulse/mobile-ui';
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
import { Stack } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Callout,
  CardSkeleton,
  confirmAction,
  DefinitionList,
  mutationErrorMessage,
  QueryErrorState,
  SectionHeader,
} from '@radial-pulse/clinic-kit';

type ClinicProfile = Schema<'ClinicProfileRead'>;

/**
 * The Practitioner Profile (`ClinicProfileRead.practitioner_profile`): the
 * clinic's main practitioner, the clinic, consultation and practice details.
 * Editable with `profile:write`; saved with `PUT /profile` (only changed
 * fields, with the version that was read).
 */
export function PractitionerProfileScreen() {
  const clinicId = useClinicId();
  const query = useClinicProfile(clinicId);
  const canEdit = useClinicCan(clinicId, 'profile:write');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Screen
      topInset={false}
      fabClearance={false}
      onRefresh={editing ? undefined : () => void query.refetch()}
      refreshing={query.isRefetching}
    >
      <Stack.Screen
        options={{ title: editing ? 'Edit Practitioner Profile' : 'Practitioner Profile' }}
      />
      {query.isLoading ? (
        <CardSkeleton lines={6} />
      ) : query.error || !query.data ? (
        <Card>
          <QueryErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : editing ? (
        // Keyed by version: reloading after a conflict starts from the latest profile.
        <EditPractitionerProfile
          key={query.data.version}
          profile={query.data}
          onReload={() => void query.refetch()}
          onDone={(didSave) => {
            setSaved(didSave);
            setEditing(false);
          }}
        />
      ) : (
        <>
          {saved ? <Callout tone="success">Practitioner Profile saved.</Callout> : null}
          <PractitionerProfileView profile={query.data.practitioner_profile} />
          {canEdit ? (
            <Button
              fullWidth
              onPress={() => {
                setSaved(false);
                setEditing(true);
              }}
            >
              Edit Practitioner Profile
            </Button>
          ) : null}
        </>
      )}
    </Screen>
  );
}

export function PractitionerProfileView({
  profile,
}: {
  profile: Schema<'PractitionerProfileRead'>;
}) {
  const num = (value: number | null) => (value === null ? null : value.toLocaleString('en-IN'));
  const schedule = profile.consultation_schedule;
  return (
    <>
      <SectionHeader title="Practitioner information" />
      <Card padding="sm">
        <View style={styles.inset}>
          <DefinitionList
            items={[
              ['Practitioner full name', profile.full_name],
              ['Specialization', profile.specialization],
              ['Qualifications', profile.qualifications],
              ['Total years of medical experience', num(profile.years_of_experience)],
            ]}
          />
        </View>
      </Card>

      <SectionHeader title="Clinic information" />
      <Card padding="sm">
        <View style={styles.inset}>
          <DefinitionList
            items={[
              ['Hospital / clinic name', profile.clinic_name],
              ['Operating since', profile.clinic_operating_since?.toString() ?? null],
              ['Address', formatClinicAddress(profile.clinic_address)],
            ]}
          />
        </View>
      </Card>

      <SectionHeader title="Consultation information" />
      <Card padding="sm">
        <View style={styles.inset}>
          <DefinitionList
            items={[
              ...scheduleLines(schedule, profile.weekly_holiday).map(
                ({ label, value }) => [label, value] as [string, string],
              ),
              ['Time zone', schedule?.timezone ?? null],
              ['Schedule notes', schedule?.notes ?? null],
              ['Weekly holiday', formatWeeklyHoliday(profile.weekly_holiday)],
              ['Consultation fee', formatConsultationFee(profile.consultation_fee)],
            ]}
          />
        </View>
      </Card>

      <SectionHeader title="Practice information" />
      <Card padding="sm">
        <View style={styles.inset}>
          <DefinitionList
            items={[
              [
                'Main services / conditions treated',
                profile.services
                  .map((s) =>
                    [s.name, s.category && `(${s.category})`, s.description && `– ${s.description}`]
                      .filter(Boolean)
                      .join(' '),
                  )
                  .join('\n') || null,
              ],
              ['Approximate patients treated', num(profile.patients_treated)],
              ['Professional highlights / achievements', profile.professional_highlights],
            ]}
          />
        </View>
      </Card>
    </>
  );
}

function EditPractitionerProfile({
  profile,
  onDone,
  onReload,
}: {
  profile: ClinicProfile;
  onDone: (saved: boolean) => void;
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

  const edit = (change: (d: PractitionerProfileDraft) => PractitionerProfileDraft) =>
    setDraft((d) => change(d));
  const setField = <K extends keyof PractitionerProfileDraft>(
    key: K,
    value: PractitionerProfileDraft[K],
  ) => edit((d) => ({ ...d, [key]: value }));
  const setAddress = (key: keyof PractitionerProfileDraft['address'], value: string) =>
    edit((d) => ({ ...d, address: { ...d.address, [key]: value } }));
  const setWindow = (day: Weekday, i: number, key: 'opens' | 'closes', value: string) =>
    edit((d) => ({
      ...d,
      days: { ...d.days, [day]: d.days[day].map((w, j) => (j === i ? { ...w, [key]: value } : w)) },
    }));
  const setService = (i: number, key: 'name' | 'category' | 'description', value: string) =>
    edit((d) => ({
      ...d,
      services: d.services.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));

  async function reload() {
    const ok = await confirmAction(
      'Reload the latest profile?',
      'Your unsaved changes in this form will be discarded.',
      'Reload',
    );
    if (ok) onReload();
  }

  function save() {
    const { errors: found, patch } = prepareProfileSave(current, draft);
    setLocalErrors(found);
    if (Object.keys(found).length > 0) return;
    if (Object.keys(patch).length === 0) return onDone(false);
    update.mutate(
      { version: profile.version, practitioner_profile: patch },
      { onSuccess: () => onDone(true) },
    );
  }

  const errorList = Object.entries(errors);
  const general =
    update.isError && Object.keys(apiErrors).length === 0 && apiError?.kind !== 'conflict'
      ? mutationErrorMessage(update.error)
      : null;

  return (
    <>
      <SectionHeader title="Practitioner information" />
      <Card>
        <View style={styles.form}>
          <Input
            label="Practitioner full name"
            value={draft.full_name}
            onChangeText={(v) => setField('full_name', v)}
            error={err('full_name')}
            required={current.practitioner_id !== null}
            autoComplete="name"
          />
          <Input
            label="Specialization"
            value={draft.specialization}
            onChangeText={(v) => setField('specialization', v)}
            error={err('specialization')}
          />
          <Input
            label="Qualifications"
            hint="For example: BDS, MDS"
            value={draft.qualifications}
            onChangeText={(v) => setField('qualifications', v)}
            error={err('qualifications')}
          />
          <Input
            label="Total years of medical experience"
            value={draft.years_of_experience}
            onChangeText={(v) => setField('years_of_experience', v)}
            error={err('years_of_experience')}
            keyboardType="number-pad"
          />
        </View>
      </Card>

      <SectionHeader title="Clinic information" />
      <Card>
        <View style={styles.form}>
          <Input
            label="Hospital / clinic name"
            value={draft.clinic_name}
            onChangeText={(v) => setField('clinic_name', v)}
            error={err('clinic_name')}
            required
          />
          <Input
            label="Operating since"
            hint="The year the clinic opened"
            value={draft.clinic_operating_since}
            onChangeText={(v) => setField('clinic_operating_since', v)}
            error={err('clinic_operating_since')}
            keyboardType="number-pad"
          />
          <Input
            label="Address"
            value={draft.address.address_line}
            onChangeText={(v) => setAddress('address_line', v)}
            error={err('clinic_address.address_line') ?? err('clinic_address')}
          />
          <Input
            label="City"
            value={draft.address.city}
            onChangeText={(v) => setAddress('city', v)}
            error={err('clinic_address.city')}
          />
          <Input
            label="State"
            value={draft.address.state}
            onChangeText={(v) => setAddress('state', v)}
            error={err('clinic_address.state')}
          />
          <Input
            label="Postal code"
            value={draft.address.postal_code}
            onChangeText={(v) => setAddress('postal_code', v)}
            error={err('clinic_address.postal_code')}
            keyboardType="number-pad"
          />
          <Input
            label="Country code"
            hint="Two letters, e.g. IN"
            value={draft.address.country}
            onChangeText={(v) => setAddress('country', v)}
            error={err('clinic_address.country')}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </Card>

      <SectionHeader title="Consultation information" />
      <Card>
        <View style={styles.form}>
          <Text style={styles.groupLabel}>Consultation days & timings</Text>
          <Text style={styles.hint}>
            24-hour times, e.g. 09:30 to 13:00. Add several windows for split hours.
          </Text>
          {WEEKDAYS.map((day) => (
            <DayWindows
              key={day}
              day={day}
              windows={draft.days[day]}
              holiday={draft.weekly_holiday.includes(day)}
              error={err(`consultation_schedule.days.${day}`)}
              windowError={(i) => err(`consultation_schedule.days.${day}.${i}`)}
              onChange={(i, key, value) => setWindow(day, i, key, value)}
              onAdd={() =>
                edit((d) => ({ ...d, days: { ...d.days, [day]: [...d.days[day], emptyWindow()] } }))
              }
              onRemove={(i) =>
                edit((d) => ({
                  ...d,
                  days: { ...d.days, [day]: d.days[day].filter((_, j) => j !== i) },
                }))
              }
            />
          ))}
          <Input
            label="Time zone"
            value={draft.timezone}
            onChangeText={(v) => setField('timezone', v)}
            error={err('consultation_schedule.timezone')}
            autoCapitalize="none"
          />
          <Input
            label="Schedule notes"
            value={draft.schedule_notes}
            onChangeText={(v) => setField('schedule_notes', v)}
            error={err('consultation_schedule.notes') ?? err('consultation_schedule')}
            multiline
          />

          <Text style={styles.groupLabel}>Weekly holiday / non-consultation day</Text>
          <View style={styles.chips} accessibilityRole="none">
            {WEEKDAYS.map((day) => {
              const selected = draft.weekly_holiday.includes(day);
              return (
                <Pressable
                  key={day}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${WEEKDAY_LABELS[day]} weekly holiday`}
                  onPress={() =>
                    setField(
                      'weekly_holiday',
                      selected
                        ? draft.weekly_holiday.filter((d) => d !== day)
                        : [...draft.weekly_holiday, day],
                    )
                  }
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {WEEKDAY_SHORT_LABELS[day]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {err('weekly_holiday') ? <Text style={styles.error}>{err('weekly_holiday')}</Text> : null}

          <Input
            label="Consultation fee"
            hint={`Amount in ${draft.fee_currency}. Leave empty if not shown.`}
            value={draft.fee_amount}
            onChangeText={(v) => setField('fee_amount', v)}
            error={
              err('consultation_fee.amount_minor') ??
              err('consultation_fee.currency') ??
              err('consultation_fee')
            }
            keyboardType="decimal-pad"
            leading={<Text style={styles.currency}>{draft.fee_currency}</Text>}
          />
        </View>
      </Card>

      <SectionHeader title="Practice information" />
      <Card>
        <View style={styles.form}>
          <Text style={styles.groupLabel}>Main services / conditions treated</Text>
          {err('services') ? <Text style={styles.error}>{err('services')}</Text> : null}
          {draft.services.map((s, i) => (
            <View key={i} style={styles.service}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>Service {i + 1}</Text>
                <IconButton
                  icon={<Trash2 size={18} color={t.color.text.secondary} />}
                  label={`Remove service ${i + 1}`}
                  onPress={() =>
                    edit((d) => ({ ...d, services: d.services.filter((_, j) => j !== i) }))
                  }
                />
              </View>
              <Input
                label="Name"
                value={s.name}
                onChangeText={(v) => setService(i, 'name', v)}
                error={err(`services.${i}.name`) ?? err(`services.${i}`)}
                required
              />
              <Input
                label="Category"
                value={s.category}
                onChangeText={(v) => setService(i, 'category', v)}
                error={err(`services.${i}.category`)}
              />
              <Input
                label="Description"
                value={s.description}
                onChangeText={(v) => setService(i, 'description', v)}
                error={err(`services.${i}.description`)}
                multiline
              />
            </View>
          ))}
          <Button
            variant="secondary"
            leadingIcon={<Plus size={16} color={t.color.text.primary} />}
            onPress={() => edit((d) => ({ ...d, services: [...d.services, emptyService()] }))}
          >
            Add service
          </Button>
          <Input
            label="Approximate patients treated"
            value={draft.patients_treated}
            onChangeText={(v) => setField('patients_treated', v)}
            error={err('patients_treated')}
            keyboardType="number-pad"
          />
          <Input
            label="Professional highlights / achievements"
            value={draft.professional_highlights}
            onChangeText={(v) => setField('professional_highlights', v)}
            error={err('professional_highlights')}
            multiline
          />
        </View>
      </Card>

      {apiError?.kind === 'conflict' ? (
        <View style={styles.form}>
          <Callout tone="warning">
            Someone else saved this profile while you were editing. Reload the latest version, then
            make your changes again.
          </Callout>
          <Button variant="secondary" fullWidth onPress={() => void reload()}>
            Reload latest profile
          </Button>
        </View>
      ) : null}
      {general ? <Callout tone="danger">{general}</Callout> : null}
      {errorList.length > 0 ? (
        <Callout tone="danger">
          {`Check these fields:\n${errorList
            .map(([key, message]) => `• ${profileErrorLabel(key)}: ${message}`)
            .join('\n')}`}
        </Callout>
      ) : null}
      <View style={styles.actions}>
        <Button fullWidth loading={update.isPending} onPress={save}>
          Save changes
        </Button>
        <Button variant="ghost" fullWidth disabled={update.isPending} onPress={() => onDone(false)}>
          Cancel
        </Button>
      </View>
    </>
  );
}

function DayWindows({
  day,
  windows,
  holiday,
  error,
  windowError,
  onChange,
  onAdd,
  onRemove,
}: {
  day: Weekday;
  windows: Array<{ opens: string; closes: string }>;
  holiday: boolean;
  error?: string;
  windowError: (i: number) => string | undefined;
  onChange: (i: number, key: 'opens' | 'closes', value: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  const name = WEEKDAY_LABELS[day];
  return (
    <View style={styles.day}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>{name}</Text>
        <Text style={styles.hint}>
          {windows.length === 0 ? (holiday ? 'Weekly holiday' : 'No consultation') : ''}
        </Text>
      </View>
      {windows.map((w, i) => (
        <View key={i} style={styles.windowRow}>
          <View style={styles.windowField}>
            <Input
              label={`${name} window ${i + 1} opens`}
              hideLabel
              placeholder="Opens 09:30"
              value={w.opens}
              onChangeText={(v) => onChange(i, 'opens', v)}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              error={windowError(i)}
            />
          </View>
          <View style={styles.windowField}>
            <Input
              label={`${name} window ${i + 1} closes`}
              hideLabel
              placeholder="Closes 13:00"
              value={w.closes}
              onChangeText={(v) => onChange(i, 'closes', v)}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
          <IconButton
            icon={<Trash2 size={18} color={t.color.text.secondary} />}
            label={`Remove ${name} window ${i + 1}`}
            onPress={() => onRemove(i)}
          />
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Plus size={16} color={t.color.text.link} />}
        onPress={onAdd}
        accessibilityLabel={`Add ${name} consultation window`}
      >
        Add window
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  inset: { paddingHorizontal: t.space[2] },
  form: { gap: t.space[4] },
  actions: { gap: t.space[2] },
  groupLabel: { ...textStyle('label'), ...fontStyle(600), color: t.color.text.primary },
  hint: { ...textStyle('bodySm'), color: t.color.text.tertiary },
  error: { ...textStyle('bodySm'), color: t.color.status.danger.fg },
  currency: { ...textStyle('body'), color: t.color.text.secondary },
  day: {
    gap: t.space[2],
    paddingBottom: t.space[3],
    borderBottomWidth: 1,
    borderBottomColor: t.color.border.subtle,
  },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space[2] },
  windowField: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] },
  chip: {
    minHeight: t.size.touchTarget,
    minWidth: t.size.touchTarget,
    paddingHorizontal: t.space[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.surface,
  },
  chipSelected: {
    backgroundColor: t.color.status.brand.bg,
    borderColor: t.color.status.brand.border,
  },
  chipText: { ...textStyle('label'), color: t.color.text.secondary },
  chipTextSelected: { ...fontStyle(600), color: t.color.status.brand.fg },
  service: {
    gap: t.space[3],
    paddingBottom: t.space[3],
    borderBottomWidth: 1,
    borderBottomColor: t.color.border.subtle,
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceTitle: { ...textStyle('body'), ...fontStyle(600), color: t.color.text.primary },
});
