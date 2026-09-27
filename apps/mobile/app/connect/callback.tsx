import { Redirect } from 'expo-router';

/**
 * Redirect target of "Connect Your Accounts" (`<scheme>://connect/callback`).
 * The in-app browser session normally captures it; if the system opens the
 * app with it instead, return to the app.
 */
export default function ConnectCallback() {
  return <Redirect href="/home" />;
}
