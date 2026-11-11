import { describe, expect, it } from 'vitest'

describe('nuxt setup', () => {
  it('has access to the Nuxt runtime config', () => {
    expect(useRuntimeConfig().public.apiBase).toBe('http://localhost:3000')
  })
})
