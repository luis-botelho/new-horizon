import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Espelha o path alias `@/*` do tsconfig.json para os testes do Vitest.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
