import '@fontsource-variable/inter';
import '@radial-pulse/design-tokens/css';
import { createSessionController } from '@radial-pulse/platform-shell/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import './app/global.css';
import { createAppRouter } from './app/router';
import { createDevSessionAdapter } from './app/session/dev-session';
import { loadRuntimeConfig } from './lib/config';

const root = createRoot(document.getElementById('root')!);

// Boot: load and validate runtime config first, then mount. An invalid config
// stops here with a readable message instead of failing somewhere deeper.
loadRuntimeConfig()
  .then((config) => {
    // Phase 7 swaps in the Cognito adapter; the development adapter refuses prod.
    const session = createSessionController(createDevSessionAdapter(config));
    void session.restore();
    root.render(
      <StrictMode>
        <App config={config} session={session} router={createAppRouter()} />
      </StrictMode>,
    );
  })
  .catch((err: unknown) => {
    root.render(<pre role="alert">{err instanceof Error ? err.message : String(err)}</pre>);
  });
