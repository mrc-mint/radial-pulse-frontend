import '@fontsource-variable/inter';
import '@radial-pulse/design-tokens/css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import './app/global.css';
import { createAppRouter } from './app/router';
import { createAppServices } from './app/services';
import { unconfiguredAuth } from './app/session/auth';
import { loadRuntimeConfig } from './lib/config';

const root = createRoot(document.getElementById('root')!);

// Boot: load and validate runtime config first, then mount. An invalid config
// stops here with a readable message instead of failing somewhere deeper.
async function boot() {
  const config = await loadRuntimeConfig();
  // Phase 7 adds the Cognito provider. Until then only mocked APIs can sign in.
  const auth = config.apiMocking
    ? await (await import('./app/mocking')).startMocking(config)
    : unconfiguredAuth;
  const { api, session } = createAppServices(config, auth);
  void session.restore();
  root.render(
    <StrictMode>
      <App config={config} session={session} api={api} router={createAppRouter()} />
    </StrictMode>,
  );
}

boot().catch((err: unknown) => {
  root.render(<pre role="alert">{err instanceof Error ? err.message : String(err)}</pre>);
});
