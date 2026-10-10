import type { AppConfig } from '@radial-pulse/config';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * Validated runtime configuration for components (ADR 0003). Apps load it once
 * at boot; nothing below the provider reads env or config.json itself.
 */
const ConfigContext = createContext<AppConfig | null>(null);

export function ConfigProvider({ config, children }: { config: AppConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): AppConfig {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('useConfig must be used inside <ConfigProvider>.');
  return config;
}
