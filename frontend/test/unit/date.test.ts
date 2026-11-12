import { describe, expect, it } from 'vitest'
import { addDays, calendarWeeks, formatBrDate, formatLongDate, maskBrDate, parseBrDate } from '../../app/utils/date'

describe('formatLongDate', () => {
  it('formats an API date the way the cards show it', () => {
    expect(formatLongDate('2024-09-01')).toBe('01 de setembro de 2024')
  })
})

describe('maskBrDate', () => {
  it('adds the slashes while the user types digits', () => {
    expect(maskBrDate('0112')).toBe('01/12')
    expect(maskBrDate('01122025')).toBe('01/12/2025')
    expect(maskBrDate('01/12/2025x9')).toBe('01/12/2025')
  })
})

describe('parseBrDate', () => {
  it('turns a typed dd/mm/aaaa date into the ISO date the API uses', () => {
    expect(parseBrDate('01/12/2025')).toBe('2025-12-01')
  })

  it('rejects incomplete and impossible dates', () => {
    expect(parseBrDate('01/12/20')).toBeNull()
    expect(parseBrDate('31/02/2025')).toBeNull()
    expect(parseBrDate('00/13/2025')).toBeNull()
  })
})

describe('formatBrDate', () => {
  it('shows an ISO date as dd/mm/aaaa', () => {
    expect(formatBrDate('2025-12-01')).toBe('01/12/2025')
  })
})

describe('calendarWeeks', () => {
  it('fills whole weeks starting on Sunday, with the days of the next and previous months', () => {
    // September 2024 starts on a Sunday and ends on a Monday
    const weeks = calendarWeeks(2024, 8)

    expect(weeks).toHaveLength(5)
    expect(weeks[0]![0]).toEqual({ iso: '2024-09-01', day: 1, inMonth: true })
    expect(weeks[4]!.map(d => d.iso)).toEqual([
      '2024-09-29', '2024-09-30', '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05',
    ])
  })

  it('starts with the last days of the previous month', () => {
    // December 2025 starts on a Monday
    expect(calendarWeeks(2025, 11)[0]![0]).toEqual({ iso: '2025-11-30', day: 30, inMonth: false })
  })
})

describe('addDays', () => {
  it('moves across months and years', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})
