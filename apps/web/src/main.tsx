import '@fontsource-variable/inter';
import '@radial-pulse/design-tokens/css';
import { isCognitoConfigured } from '@radial-pulse/config';
import {
  createAppServices,
  unconfiguredAuth,
  type AuthProvider,
} from '@radial-pulse/platform-shell/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import './app/global.css';
import { AUTH_CALLBACK_PATH, completeWebSignIn, createWebCognitoAuth } from './app/cognito';
import { createAppRouter } from './app/router';
import { loadRuntimeConfig } from './lib/config';

const root = createRoot(document.getElementById('root')!);

// Boot: load and validate runtime config first, then mount. An invalid config
// stops here with a readable message instead of failing somewhere deeper.
async function boot() {
  const config = await loadRuntimeConfig();
  // Cognito Managed Login (PKCE) when configured; persona sign-in only with
  // API mocking (never in prod); otherwise no sign-in.
  let auth: AuthProvider = unconfiguredAuth;
  if (config.apiMocking) {
    auth = await (await import('./app/mocking')).startMocking(config);
  } else if (isCognitoConfigured(config)) {
    const cognito = createWebCognitoAuth(config);
    auth = cognito;
    // Back from Managed Login: exchange the code before the app mounts, then
    // drop the code from the address bar.
    if (window.location.pathname === AUTH_CALLBACK_PATH) {
      root.render(<p role="status">Signing you in…</p>);
      window.history.replaceState(null, '', await completeWebSignIn(cognito));
    }
  }
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
