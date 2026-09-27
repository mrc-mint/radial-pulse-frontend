/**
 * The only thing the API client knows about authentication.
 * The platform shell provides it (Amplify-backed on both platforms, Phase 7).
 * The client never touches Cognito, browser storage or SecureStore.
 */
export interface AuthBridge {
  getAccessToken(): Promise<string | null>;
  onUnauthorized(): void;
}
