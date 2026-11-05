import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const AUTH = { loanleaf: '.auth/loanleaf.json', ciihive: '.auth/ciihive.json' };

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,   // modules form a chain, so keep order
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup-loanleaf', testMatch: /loanleaf\.setup\.ts/ },
    { name: 'setup-ciihive', testMatch: /ciihive\.setup\.ts/ },
    {
      name: 'loanleaf',
      testDir: './tests/loanleaf',
      dependencies: ['setup-loanleaf'],
      use: { storageState: AUTH.loanleaf },
    },
    {
      name: 'ciihive',
      testDir: './tests/ciihive',
      dependencies: ['setup-ciihive'],
      use: { storageState: AUTH.ciihive },
    },
    {
      // End-to-end write flow (create customer, loan, disburse, authorize).
      // Each spec logs in itself. Skips unless ALLOW_WRITES=1.
      name: 'flow',
      testDir: './tests/flow',
      timeout: 900_000,
    },
    {
      name: 'qa-loanleaf',
      testDir: './tests/loanleaf',
      testMatch: /02-qa-recheck\.spec\.ts$/,
      dependencies: ['setup-loanleaf'],
      use: {
        storageState: AUTH.loanleaf,
        screenshot: 'off',
        video: 'off',
        trace: 'off',
      },
    },
    {
      name: 'qa-ciihive',
      testDir: './tests/ciihive',
      testMatch: /02-qa-recheck\.spec\.ts$/,
      dependencies: ['setup-ciihive'],
      use: {
        storageState: AUTH.ciihive,
        screenshot: 'off',
        video: 'off',
        trace: 'off',
      },
    },
  ],
});
