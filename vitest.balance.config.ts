import { defineConfig } from 'vitest/config';

// 200-match strength suites. Slower; run with `npm run test:balance`.
export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.balance.test.ts'],
    testTimeout: 600_000,
    pool: 'threads',
  },
});
