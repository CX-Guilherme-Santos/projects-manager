import { describe, expect, it } from 'vitest'
import { formatLongDate } from '../../app/utils/date'

describe('formatLongDate', () => {
  it('formats an API date the way the cards show it', () => {
    expect(formatLongDate('2024-09-01')).toBe('01 de setembro de 2024')
  })
})
