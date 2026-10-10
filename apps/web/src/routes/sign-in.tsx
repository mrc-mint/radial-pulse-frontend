import { useConfig, useSession } from '@radial-pulse/shell-core';
import { AuthLayout, FullPageLoading } from '@radial-pulse/web-shell';
import { Badge, Button, Card, ErrorState } from '@radial-pulse/web-ui';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronRight, LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { authErrorMessage, safeReturnPath } from '../app/cognito';
import './sign-in.css';

export const Route = createFileRoute('/sign-in')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; auth_error?: string } => ({
    redirect: safeReturnPath(search.redirect),
    auth_error: typeof search.auth_error === 'string' ? search.auth_error : undefined,
  }),
  component: SignInPage,
});

function SignInPage() {
  const { state, signIn, signInOptions, signInMethod, retry } = useSession();
  const { redirect, auth_error: authError } = Route.useSearch();
  const router = useRouter();
  const config = useConfig();

  useEffect(() => {
    if (state.status === 'authenticated') router.history.replace(redirect ?? '/dashboard');
  }, [state.status, redirect, router]);

  if (state.status === 'loading' || state.status === 'authenticated') return <FullPageLoading />;

  return (
    <AuthLayout>
      <Card padding="lg">
        <div className="rp-sign-in">
          <div className="rp-sign-in__heading">
            <h1>Sign in</h1>
            <p>
              {signInMethod === 'cognito'
                ? 'Welcome back. Sign in with your Radial Pulse email and password.'
                : 'Welcome back. Choose how you want to continue.'}
            </p>
          </div>

          {authError && state.status !== 'error' && (
            <p className="rp-form__error" role="alert">
              {authErrorMessage(authError)}
            </p>
          )}

          {state.status === 'error' && (
            <ErrorState
              title="Sign-in didn’t complete"
              description="Please try again."
              onRetry={() => void retry()}
            />
          )}

          {signInMethod === 'cognito' ? (
            <>
              <Button
                fullWidth
                size="lg"
                leadingIcon={<LogIn size={18} aria-hidden="true" />}
                onClick={() => void signIn()}
              >
                Sign in
              </Button>
              <p className="rp-sign-in__note">
                You’ll continue on the secure Radial Pulse sign-in page. Studio is for the Radial
                Pulse team; clinic accounts are not supported yet.
              </p>
            </>
          ) : signInOptions.length > 0 ? (
            <>
              {config.appEnv !== 'prod' && (
                <Badge tone="warning" dot>
                  Development sign-in — no password required
                </Badge>
              )}
              <ul className="rp-sign-in__options" aria-label="Sign-in options">
                {signInOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      className="rp-sign-in__option"
                      onClick={() => void signIn(option.id)}
                    >
                      <span className="rp-sign-in__option-text">
                        <span className="rp-sign-in__option-label">Continue as {option.label}</span>
                        {option.description && (
                          <span className="rp-sign-in__option-description">
                            {option.description}
                          </span>
                        )}
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rp-sign-in__unavailable" role="status">
              Sign-in isn’t configured for this environment yet. Set the Cognito values in
              config.json, or use a build with API mocking enabled.
            </p>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
}
