import { Redirect } from 'expo-router';

/**
 * Cognito Managed Login redirect (`<scheme>://auth/callback`). The auth
 * session captures it and completes sign-in; if the system opens the app with
 * it instead, return to the start, where the session gate decides.
 */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
