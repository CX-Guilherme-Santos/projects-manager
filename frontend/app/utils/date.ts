// The API sends plain dates ("2024-09-01"). Both parsing and formatting use UTC,
// so the day never shifts with the browser's time zone.
const longDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`))
}

// --- Date field: the user sees dd/mm/aaaa, the API gets YYYY-MM-DD ---

const pad = (value: number) => String(value).padStart(2, '0')

const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`

// Keeps only digits and inserts the slashes: "0112" → "01/12"
export function maskBrDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/')
}

// "01/12/2025" → "2025-12-01"; null for incomplete or impossible dates (31/02)
export function parseBrDate(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return null

  const [day, month, year] = match.slice(1).map(Number) as [number, number, number]
  const date = new Date(Date.UTC(year, month - 1, day))
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day

  return exists ? toIso(year, month - 1, day) : null
}

export function formatBrDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export interface CalendarDay {
  iso: string
  day: number
  inMonth: boolean
}

// Weeks (Sunday first) covering the month, padded with the neighbouring months' days.
// `month` is 0-based, like Date.
export function calendarWeeks(year: number, month: number): CalendarDay[][] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  const days = Array.from({ length: totalCells }, (_, cell) => {
    const date = new Date(Date.UTC(year, month, cell - firstWeekday + 1))
    return {
      iso: toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month,
    }
  })

  return Array.from({ length: totalCells / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7))
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}
