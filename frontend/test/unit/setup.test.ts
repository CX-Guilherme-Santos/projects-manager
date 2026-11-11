import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('unit setup', () => {
  it('runs zod schemas outside Nuxt', () => {
    const schema = z.string().min(1)
    expect(schema.safeParse('').success).toBe(false)
  })
})
