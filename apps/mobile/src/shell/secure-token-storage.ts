import type { AuthStorage } from '@radial-pulse/auth';

/**
 * Sign-in tokens in the device keychain / keystore (expo-secure-store), never
 * in AsyncStorage. Secure-store values should stay under ~2 KB and Cognito
 * tokens can exceed that, so values are split into chunks (ADR 0006).
 */

/** The parts of expo-secure-store this adapter uses (injected for tests). */
export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

const CHUNK = 1800;
/** Secure-store keys allow letters, digits, ".", "-" and "_". */
const safeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

export function createChunkedSecureStorage(store: SecureStoreLike): AuthStorage {
  const countKey = (key: string) => `${safeKey(key)}.n`;
  const partKey = (key: string, i: number) => `${safeKey(key)}.${i}`;

  async function remove(key: string) {
    const count = Number((await store.getItemAsync(countKey(key))) ?? 0);
    await Promise.all(
      Array.from({ length: count }, (_, i) => store.deleteItemAsync(partKey(key, i))),
    );
    await store.deleteItemAsync(countKey(key));
  }

  return {
    async getItem(key) {
      const count = Number((await store.getItemAsync(countKey(key))) ?? 0);
      if (!count) return null;
      const parts = await Promise.all(
        Array.from({ length: count }, (_, i) => store.getItemAsync(partKey(key, i))),
      );
      // A missing part means a half-written value: treat it as absent.
      return parts.every((p) => p !== null) ? parts.join('') : null;
    },
    async setItem(key, value) {
      await remove(key);
      const parts = Array.from({ length: Math.ceil(value.length / CHUNK) || 1 }, (_, i) =>
        value.slice(i * CHUNK, (i + 1) * CHUNK),
      );
      await Promise.all(parts.map((p, i) => store.setItemAsync(partKey(key, i), p)));
      await store.setItemAsync(countKey(key), String(parts.length));
    },
    removeItem: remove,
  };
}
