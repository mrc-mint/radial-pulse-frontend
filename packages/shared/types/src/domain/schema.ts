import type { components, operations } from '../contract';

/**
 * Named access to generated contract types. Entity types are never
 * hand-written: `Schema<'ClinicRead'>` is the contract's ClinicRead.
 */
export type Schema<K extends keyof components['schemas']> = components['schemas'][K];

/** Successful JSON body of a contract operation (200/201/202). */
export type OperationResult<K extends keyof operations> = operations[K] extends {
  responses: infer R;
}
  ? R extends { 200: { content: { 'application/json': infer B } } }
    ? B
    : R extends { 201: { content: { 'application/json': infer B } } }
      ? B
      : R extends { 202: { content: { 'application/json': infer B } } }
        ? B
        : never
  : never;
