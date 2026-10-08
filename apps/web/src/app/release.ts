/**
 * What this Studio build offers. V1 deploys Studio without the V2 features
 * (docs/scope-v1.md): their code stays in the repository, switched off here.
 * Turn a flag on when its V2 release ships.
 */
export const STUDIO_FEATURES = {
  /** Client Collaboration (chat): section, dashboard widgets, row action, unread badge. */
  clientCollaboration: false,
  /** Voice samples on the Media section (`audio` files). V1 media is photos only. */
  voiceSamples: false,
} as const;
