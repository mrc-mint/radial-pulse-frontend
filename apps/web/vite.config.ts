import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// No environment values are baked into the build: configuration is loaded at
// runtime from /config.json so the same artifact is promoted dev → prod.
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
  server: { port: 4200 },
  build: { outDir: 'dist', sourcemap: true },
  test: { environment: 'jsdom' },
});
