import { Screen } from '@radial-pulse/mobile-shell';
import { useLocalSearchParams } from 'expo-router';
import { AssessmentView, parseComponent } from './assessment-view';

/** One published assessment, opened from Assessments (`/assessment/[assessmentId]`). */
export function AssessmentScreen() {
  const params = useLocalSearchParams<{ assessmentId: string; component?: string }>();
  return (
    <AssessmentView
      assessmentId={params.assessmentId}
      component={parseComponent(params.component)}
      renderScreen={({ header, content, onRefresh, refreshing }) => (
        <Screen
          topInset={false}
          fabClearance={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          header={header}
        >
          {content}
        </Screen>
      )}
    />
  );
}
