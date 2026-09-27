import { useConfig, useSession } from '@radial-pulse/platform-shell/core';
import { AuthLayout, FullPageLoading } from '@radial-pulse/platform-shell/web';
import { Badge, Card, ErrorState } from '@radial-pulse/ui/web';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import './sign-in.css';

/** Only same-origin app paths (never sign-in itself) are accepted as a destination. */
function safeRedirect(value: unknown): string | undefined {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/sign-in')
    ? value
    : undefined;
}

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirect(search.redirect),
  }),
  component: SignInPage,
});

function SignInPage() {
  const { state, signIn, signInOptions, retry } = useSession();
  const { redirect } = Route.useSearch();
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
            <p>Welcome back. Choose how you want to continue.</p>
          </div>

          {state.status === 'error' && (
            <ErrorState
              title="Sign-in didn’t complete"
              description="Please try again."
              onRetry={() => void retry()}
            />
          )}

          {signInOptions.length > 0 ? (
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
            // Cognito sign-in arrives in Phase 7 (ADR 0006). Until then only the
            // API mocks provide sign-in options.
            <p className="rp-sign-in__unavailable" role="status">
              Sign-in isn’t configured for this environment yet. Use a build with API mocking
              enabled, or wait for Cognito sign-in.
            </p>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
}
