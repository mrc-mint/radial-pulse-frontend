import { z } from 'zod';

/**
 * Environments (decision 3): local, dev and prod. No staging in V1.
 */
export const APP_ENVS = ['local', 'dev', 'prod'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

/**
 * Raw, platform-agnostic configuration. Each app maps its own source into
 * this shape exactly once at startup:
 *   - web:    runtime /config.json served per environment (build once, promote)
 *   - mobile: EXPO_PUBLIC_* values baked in per EAS build profile
 * Packages never read import.meta.env or process.env themselves.
 *
 * Nothing here is secret: every value ships to the client.
 */
const rawSchema = z
  .object({
    appEnv: z.enum(APP_ENVS),
    /** API Gateway custom domain for the environment. The only backend URL the frontend knows. */
    apiBaseUrl: z.url(),
    cognito: z.object({
      userPoolId: z.string().min(1),
      userPoolClientId: z.string().min(1),
      /** Managed-login domain, e.g. auth.dev.example.com */
      domain: z.string().min(1),
      /** OAuth scopes the public app client allows (Authorization Code + PKCE). */
      scopes: z.array(z.string().min(1)).min(1).default(['openid', 'email']),
    }),
    apiMocking: z.boolean().default(false),
  })
  .superRefine((cfg, ctx) => {
    if (cfg.appEnv === 'prod' && cfg.apiMocking) {
      ctx.addIssue({
        code: 'custom',
        path: ['apiMocking'],
        message: 'API mocking can never be enabled in prod.',
      });
    }
  });

export type RawConfig = z.input<typeof rawSchema>;
export type AppConfig = Readonly<z.output<typeof rawSchema>>;

export class ConfigError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid application configuration:\n  - ${issues.join('\n  - ')}`);
    this.name = 'ConfigError';
  }
}

/** Validates raw configuration and fails fast with a readable message. */
export function createConfig(raw: unknown): AppConfig {
  const result = rawSchema.safeParse(raw);
  if (!result.success) {
    throw new ConfigError(
      result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    );
  }
  return Object.freeze(result.data);
}

/** Placeholder value in committed example configuration. */
const PLACEHOLDER = 'REPLACE_ME';

/**
 * True when the Cognito values are real (not the committed placeholders), so
 * Managed Login can be offered. Otherwise the app runs without sign-in.
 */
export function isCognitoConfigured(config: Pick<AppConfig, 'cognito'>): boolean {
  const { userPoolId, userPoolClientId, domain } = config.cognito;
  return [userPoolId, userPoolClientId, domain].every((v) => v && v !== PLACEHOLDER);
}
