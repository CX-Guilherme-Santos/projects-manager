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
