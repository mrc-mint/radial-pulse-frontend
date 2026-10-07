import { Redirect } from 'expo-router';

/** Cognito sign-out redirect (`<scheme>://signed-out`): back to the start. */
export default function SignedOut() {
  return <Redirect href="/" />;
}
