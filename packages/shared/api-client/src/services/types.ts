import type { paths } from '@radial-pulse/shared-types';

/** Helpers shared by the services: contract query/body types and path params. */
type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

/** Query parameters of a contract operation. */
export type QueryOf<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  parameters: { query?: infer Q };
}
  ? NonNullable<Q>
  : never;

/** JSON request body of a contract operation. */
export type BodyOf<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody: infer R;
}
  ? Json<R>
  : paths[P][M] extends { requestBody?: infer R }
    ? Json<NonNullable<R>>
    : never;

export const clinicPath = (clinic_id: string) => ({ path: { clinic_id } });
