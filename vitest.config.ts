import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts', 'apps/*/test/**/*.test.ts', 'apps/web/src/**/*.test.ts', 'tools/**/*.test.ts'],
    exclude: ['**/*.balance.test.ts', '**/node_modules/**'],
    testTimeout: 60_000,
  },
});
