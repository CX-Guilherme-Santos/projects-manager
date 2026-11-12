import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const API_URL = 'http://localhost:3000'
const APP_URL = 'http://localhost:3001'

export default defineConfig({
  testDir: './tests',
  // The tests share one database (emptied before each test), so they run one at a time
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',

  use: {
    baseURL: APP_URL,
    // Kept only for failed tests: open with `npm run report` (or `npx playwright show-trace <trace.zip>`)
    trace: 'retain-on-failure',
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
      // The production build (the same static site Cloudflare Pages serves), not
      // `nuxt dev`: the dev server compiles pages and optimizes dependencies on the
      // first visit, which made the first test slow and flaky on CI
      command: 'npm --prefix ../frontend run generate && npx serve --single --no-clipboard --no-request-logging --listen 3001 ../frontend/dist',
      url: APP_URL,
      env: { NUXT_PUBLIC_API_BASE: API_URL },
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
})
