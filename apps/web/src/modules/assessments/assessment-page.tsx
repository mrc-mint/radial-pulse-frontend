import {
  useAssessment,
  useAssessments,
  useRequestAssessment,
} from '@radial-pulse/api-client/react';
import { useClinicCan, useClinicId } from '@radial-pulse/platform-shell/core';
import type { Schema } from '@radial-pulse/shared-types';
import {
  APPROVAL_STATE_TONES,
  ASSESSMENT_STATUS_TONES,
  Badge,
  Button,
  Card,
  COMPONENT_STATUS_TONES,
  EmptyState,
  FindingCard,
  findingCardProps,
  formatDate,
  PUBLICATION_STATE_TONES,
  ScoreCard,
  Select,
} from '@radial-pulse/ui/web';
import {
  APPROVAL_STATE_LABELS,
  ASSESSMENT_COMPONENT_LABELS,
  ASSESSMENT_STATUS_LABELS,
  formatComponentScore,
  overallScoreEmptyLabel,
  showsComponentScore,
  PUBLICATION_STATE_LABELS,
} from '@radial-pulse/utils';
import { useNavigate } from '@tanstack/react-router';
import { FileSearch, Info, RefreshCw } from 'lucide-react';
import { CardSkeleton, mutationErrorMessage, QueryError, Section } from '../../app/page-kit';
import './assessment.css';

type Assessment = Schema<'AssessmentDetail'>;
type Component = Schema<'ComponentDetail'>;

/**
 * The one combined Digital Presence Assessment for a client organization.
 * Sections render generically from the contract's components; unavailable
 * components read "Not Available", never 0.
 */
export function AssessmentPage({ assessmentId }: { assessmentId?: string }) {
  const clinicId = useClinicId();
  const navigate = useNavigate();
  const list = useAssessments(clinicId, { limit: 20 });
  const canRequest = useClinicCan(clinicId, 'assessments:request');
  const request = useRequestAssessment(clinicId);
  const selectedId = assessmentId ?? list.data?.items[0]?.id ?? null;
  const detail = useAssessment(clinicId, selectedId);

  const open = (id: string) =>
    void navigate({
      to: '/clinics/$clinicId/assessment/$assessmentId',
      params: { clinicId, assessmentId: id },
    });

  const requestButton = canRequest && (
    <Button
      variant="secondary"
      leadingIcon={<RefreshCw size={16} />}
      loading={request.isPending}
      onClick={() => request.mutate({}, { onSuccess: (a) => open(a.id) })}
    >
      Request new assessment
    </Button>
  );

  if (list.isError) {
    return (
      <Card>
        <QueryError error={list.error} onRetry={() => void list.refetch()} />
      </Card>
    );
  }
  if (!list.data) return <CardSkeleton lines={6} />;

  if (list.data.items.length === 0) {
    return (
      <Card>
        <EmptyState
          variant="page"
          icon={<FileSearch size={22} />}
          title="No assessments yet"
          description={
            canRequest
              ? 'Request the first Digital Presence Assessment for this client organization.'
              : 'Published assessments for this client organization will appear here.'
          }
          action={requestButton}
        />
      </Card>
    );
  }

  return (
    <div className="rp-stack">
      <div className="rp-row rp-row--between">
        <div className="rp-assessment__picker">
          <Select
            label="Assessment"
            value={selectedId}
            onChange={open}
            options={list.data.items.map((a) => ({
              value: a.id,
              label: `Assessment #${a.sequence} · ${formatDate(a.created_at)} · ${ASSESSMENT_STATUS_LABELS[a.status]}`,
            }))}
          />
        </div>
        {requestButton}
      </div>
      {request.isError && (
        <p className="rp-form__error" role="alert">
          {mutationErrorMessage(request.error)}
        </p>
      )}

      {detail.isError ? (
        <Card>
          <QueryError error={detail.error} onRetry={() => void detail.refetch()} />
        </Card>
      ) : !detail.data ? (
        <CardSkeleton lines={6} />
      ) : (
        <AssessmentReport clinicId={clinicId} assessment={detail.data} />
      )}
    </div>
  );
}

const STATUS_CAPTION: Record<Component['status'], string | null> = {
  completed: null,
  pending: 'Waiting for results.',
  failed: 'The data for this component could not be collected.',
  not_available: 'No engine is available for this component yet.',
};

function AssessmentReport({
  clinicId,
  assessment: a,
}: {
  clinicId: string;
  assessment: Assessment;
}) {
  const canReview = useClinicCan(clinicId, 'approvals:decide');
  const competitor = a.components.find((c) => c.key === 'competitor_benchmark');
  const inFlight = a.status === 'queued' || a.status === 'running';
  const withFindings = a.components.filter((c) => c.findings.length > 0);

  return (
    <>
      <div className="rp-row">
        <Badge tone={ASSESSMENT_STATUS_TONES[a.status]} dot>
          {ASSESSMENT_STATUS_LABELS[a.status]}
        </Badge>
        <Badge tone={APPROVAL_STATE_TONES[a.approval_state]}>
          Review: {APPROVAL_STATE_LABELS[a.approval_state]}
        </Badge>
        <Badge tone={PUBLICATION_STATE_TONES[a.publication_state]}>
          {PUBLICATION_STATE_LABELS[a.publication_state]}
          {a.published_at ? ` · ${formatDate(a.published_at)}` : ''}
        </Badge>
        <span className="rp-muted rp-small">Methodology {a.methodology_version}</span>
      </div>

      {canReview && (
        <p className="rp-callout" role="note">
          <Info size={16} aria-hidden="true" />
          <span>
            Review and publishing actions for assessments aren’t available here yet. Clients only
            see an assessment after it is published.
          </span>
        </p>
      )}

      <div className="rp-assessment__overview">
        <ScoreCard
          label="Overall score"
          score={a.overall_score}
          emptyLabel={overallScoreEmptyLabel(a.status)}
          caption={a.summary ?? undefined}
          comparison={
            competitor
              ? {
                  label: ASSESSMENT_COMPONENT_LABELS.competitor_benchmark,
                  score: competitor.status === 'completed' ? competitor.score : null,
                  emptyLabel: formatComponentScore(competitor),
                }
              : undefined
          }
        />
      </div>

      <Section title="Components">
        <div className="rp-assessment__components">
          {a.components
            .filter((c) => showsComponentScore(c.key))
            .map((c) => (
              <ScoreCard
                key={c.key}
                label={ASSESSMENT_COMPONENT_LABELS[c.key]}
                score={c.status === 'completed' ? c.score : null}
                emptyLabel={formatComponentScore(c)}
                tone={COMPONENT_STATUS_TONES[c.status]}
                caption={c.summary ?? STATUS_CAPTION[c.status] ?? undefined}
              />
            ))}
        </div>
      </Section>

      <Section title="Findings and improvement opportunities">
        {withFindings.length === 0 ? (
          <Card>
            <EmptyState
              title={inFlight ? 'Findings will appear when the assessment finishes' : 'No findings'}
              description={inFlight ? undefined : 'This assessment did not produce any findings.'}
            />
          </Card>
        ) : (
          withFindings.map((c) => (
            <section
              key={c.key}
              className="rp-stack-sm"
              aria-label={ASSESSMENT_COMPONENT_LABELS[c.key]}
            >
              <h3 className="rp-assessment__group">
                {ASSESSMENT_COMPONENT_LABELS[c.key]}
                <span className="rp-muted"> · {c.findings.length}</span>
              </h3>
              {c.findings.map((f) => (
                <FindingCard key={f.id} titleAs="h4" {...findingCardProps(f)} />
              ))}
            </section>
          ))
        )}
      </Section>
    </>
  );
}
