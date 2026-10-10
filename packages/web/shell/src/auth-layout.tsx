import type { ReactNode } from 'react';
import './auth-layout.css';
import { Brand } from './brand';

/**
 * Layout for unauthenticated screens (sign-in, signed-out, auth errors).
 * Email and password are entered on Cognito Managed Login, never in the app;
 * this layout frames the app's side of the flow.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="rp-auth">
      <aside className="rp-auth__panel">
        <Brand />
        <div className="rp-auth__pitch">
          <p className="rp-auth__headline">Digital presence, managed for every clinic.</p>
          <p className="rp-auth__copy">
            Digital Presence Assessments, social presence insights and client collaboration in one
            workspace.
          </p>
        </div>
      </aside>
      <main className="rp-auth__main">{children}</main>
    </div>
  );
}
