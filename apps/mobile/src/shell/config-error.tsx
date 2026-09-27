import { ConfigError } from '@radial-pulse/config';
import { FullScreenMessage } from '@radial-pulse/platform-shell/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** Invalid build configuration: stop with a readable message instead of failing deeper. */
export function ConfigErrorScreen({ error }: { error: unknown }) {
  return (
    <SafeAreaProvider>
      <FullScreenMessage
        title="This build isn’t configured correctly"
        description={
          error instanceof ConfigError
            ? error.message
            : 'The app could not start. Please update it.'
        }
      />
    </SafeAreaProvider>
  );
}
