import { defineConfig } from '@playwright/test'

/**
 * Playwright configuration for backend API-only tests
 * No web server needed
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: '**/backend-api.spec.ts',
    },
  ],
})
