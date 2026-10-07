/**
 * The only thing the API client knows about authentication.
 * The platform shell provides it from the Cognito provider (Authorization Code
 * + PKCE, platform-shell `createCognitoAuth`) or, with API mocking, a mock
 * persona. The client never touches Cognito, browser storage or SecureStore.
 */
export interface AuthBridge {
  getAccessToken(): Promise<string | null>;
  onUnauthorized(): void;
}
