import { afterEach, describe, expect, it, vi } from 'vitest'
import { fakeProjectsApi } from './support/fakeApi'

let api: ReturnType<typeof fakeProjectsApi>
afterEach(() => api?.restore())

describe('useProjectCount', () => {
  it('asks the API once for how many projects are registered', async () => {
    api = fakeProjectsApi([{ favorite: true }, {}, {}])

    const { count } = useProjectCount()

    await vi.waitFor(() => expect(count.value).toBe(3))
    expect(api.requests.count).toBe(1)
  })

  it('goes down when a project is removed, without asking the API again', async () => {
    api = fakeProjectsApi([{}, {}])
    const { count, decrement } = useProjectCount()
    await vi.waitFor(() => expect(count.value).toBe(2))

    decrement()

    expect(count.value).toBe(1)
    expect(api.requests.count).toBe(1)
  })
})
