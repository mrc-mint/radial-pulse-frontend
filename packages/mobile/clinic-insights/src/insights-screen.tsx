import { Screen } from '@radial-pulse/mobile-shell';
import { PageHeader } from '@radial-pulse/mobile-ui';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { AssessmentView, parseComponent } from './assessment-view';

/** Insights tab: the latest published assessment (earlier ones via the picker). */
export function InsightsScreen() {
  const params = useLocalSearchParams<{ component?: string }>();
  return (
    <AssessmentView
      assessmentId={null}
      component={parseComponent(params.component)}
      renderScreen={({ header, content, onRefresh, refreshing }) => (
        <Screen
          onRefresh={onRefresh}
          refreshing={refreshing}
          header={
            <View>
              <PageHeader title="Insights" description="Your Digital Presence Assessment" />
              {header}
            </View>
          }
        >
          {content}
        </Screen>
      )}
    />
  );
}
