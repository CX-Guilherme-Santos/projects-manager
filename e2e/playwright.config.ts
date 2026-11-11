import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const API_URL = 'http://localhost:3000'
const APP_URL = 'http://localhost:3001'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Starts both apps. Locally, reuses them if `bin/dev` is already running.
  // The test database must exist: `cd backend && RAILS_ENV=test bin/rails db:prepare`
  webServer: [
    {
      command: 'bin/rails server -p 3000',
      cwd: '../backend',
      url: `${API_URL}/up`,
      env: { RAILS_ENV: 'test' },
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: APP_URL,
      env: { NUXT_PUBLIC_API_BASE: API_URL },
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
})
