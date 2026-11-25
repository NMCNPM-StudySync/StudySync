import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration test cần PostgreSQL test riêng: chạy bằng `npm run test:integration`.
    exclude: [...configDefaults.exclude, 'tests/integration/**'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        branches: 95,
      },
    },
  },
});
