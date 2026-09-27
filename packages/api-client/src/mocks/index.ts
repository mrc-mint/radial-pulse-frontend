/**
 * @radial-pulse/api-client/mocks — MSW handlers (dev/test only).
 *
 * Rules (see ./README.md):
 *   - A mock may exist only for an endpoint that is in the published contract
 *     but not yet implemented by the backend.
 *   - Enabled only when AppConfig.apiMocking is true, which createConfig()
 *     rejects in prod.
 *   - Never fabricate social-media metrics or scores.
 */
export const mockedEndpoints: ReadonlyArray<{ operation: string; contractVersion: string }> = [];
