import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test as base, expect } from '@playwright/test'

export const API_URL = 'http://localhost:3000/api/v1'
export const COVER_FIXTURE = path.resolve(import.meta.dirname, '../../../backend/spec/fixtures/files/cover.png')
const BACKEND_DIR = path.resolve(import.meta.dirname, '../../../backend')

export interface NewProject {
  name: string
  client?: string
  start_date?: string
  end_date?: string
  favorite?: boolean
}

// "YYYY-MM-DD" n days from today, so date-based sorting keeps working over time
export function daysFromToday(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0')).join('-')
}

export const test = base.extend<{ cleanDatabase: void, createProject: (project: NewProject) => Promise<void> }>({
  // Every test starts from an empty test database. The rake task refuses to run
  // outside RAILS_ENV=test, and no reset endpoint exists in the API.
  cleanDatabase: [async ({ request }, use) => {
    execFileSync('bin/rails', ['e2e:reset'], {
      cwd: BACKEND_DIR,
      env: { ...process.env, RAILS_ENV: 'test' },
      stdio: 'pipe',
    })

    // Guard: a reused API on :3000 (bin/dev) would point to the development database
    const response = await request.get(`${API_URL}/projects/count`)
    const { count } = await response.json()
    if (count !== 0) {
      throw new Error('The API on :3000 is not using the test database. Stop bin/dev (or docker compose) and run again.')
    }

    await use()
  }, { auto: true }],

  // Projects needed as a starting point are created through the real API (faster than the form)
  createProject: async ({ request }, use) => {
    await use(async ({ name, client = 'Clicksign', start_date = daysFromToday(-30), end_date = daysFromToday(60), favorite = false }) => {
      const response = await request.post(`${API_URL}/projects`, {
        multipart: {
          'project[name]': name,
          'project[client]': client,
          'project[start_date]': start_date,
          'project[end_date]': end_date,
          'project[favorite]': String(favorite),
        },
      })
      expect(response.status(), await response.text()).toBe(201)
    })
  },
})

export { expect }
