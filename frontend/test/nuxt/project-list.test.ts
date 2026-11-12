import { afterEach, describe, expect, it, vi } from 'vitest'
import { fakeProjectsApi } from './support/fakeApi'
import type { ProjectListQuery } from '~/types/project'

let api: ReturnType<typeof fakeProjectsApi>
afterEach(() => api?.restore())

async function loadedList(query: ProjectListQuery = {}) {
  const list = useProjectList(ref(query))
  await vi.waitFor(() => expect(list.status.value).toBe('ready'))
  return list
}

describe('useProjectList', () => {
  it('loads the first page with the total from the headers', async () => {
    api = fakeProjectsApi(Array.from({ length: 12 }, () => ({})))

    const list = await loadedList()

    expect(list.projects.value).toHaveLength(10)
    expect(list.total.value).toBe(12)
    expect(list.hasNext.value).toBe(true)
  })

  it('appends the next page on loadMore until there are no more pages', async () => {
    api = fakeProjectsApi(Array.from({ length: 12 }, () => ({})))
    const list = await loadedList()

    await list.loadMore()

    expect(list.projects.value.map(p => p.name)).toEqual(api.db.map(p => p.name))
    expect(list.hasNext.value).toBe(false)
  })

  it('ignores loadMore while a page is loading or when there is no next page', async () => {
    api = fakeProjectsApi(Array.from({ length: 12 }, () => ({})))
    const list = await loadedList()

    // the infinite scroll sentinel can fire several times in a row
    await Promise.all([list.loadMore(), list.loadMore()])
    await list.loadMore()

    expect(list.projects.value).toHaveLength(12)
  })

  it('reloads from the first page when the query changes', async () => {
    api = fakeProjectsApi([{ favorite: true }, {}, { favorite: true }])
    const query = ref<ProjectListQuery>({})
    const list = useProjectList(query)
    await vi.waitFor(() => expect(list.total.value).toBe(3))

    query.value = { favorite: true }

    await vi.waitFor(() => expect(list.total.value).toBe(2))
    expect(list.projects.value.every(p => p.favorite)).toBe(true)
  })

  it('ignores a slow response that arrives after a newer query', async () => {
    api = fakeProjectsApi([{ favorite: true }, {}])
    api.slowUnfiltered(50)
    const query = ref<ProjectListQuery>({})
    const list = useProjectList(query)

    query.value = { favorite: true }
    await vi.waitFor(() => expect(list.status.value).toBe('ready'))
    await new Promise(resolve => setTimeout(resolve, 80))

    expect(list.total.value).toBe(1)
  })

  it('discards a next page that arrives after the query changed', async () => {
    api = fakeProjectsApi(Array.from({ length: 12 }, (_, i) => ({ favorite: i === 0 })))
    api.slowUnfiltered(30)
    const query = ref<ProjectListQuery>({})
    const list = useProjectList(query)
    await vi.waitFor(() => expect(list.status.value).toBe('ready'))

    const pending = list.loadMore()
    query.value = { favorite: true }
    await pending
    await vi.waitFor(() => expect(list.status.value).toBe('ready'))

    expect(list.projects.value.map(p => p.favorite)).toEqual([true])
  })

  describe('toggleFavorite', () => {
    it('favorites the project in the list and in the API', async () => {
      api = fakeProjectsApi([{}])
      const list = await loadedList()

      await list.toggleFavorite(list.projects.value[0]!)

      expect(list.projects.value[0]!.favorite).toBe(true)
      expect(api.db[0]!.favorite).toBe(true)
    })

    it('rolls the star back and rethrows when the API fails', async () => {
      api = fakeProjectsApi([{}])
      const list = await loadedList()
      api.fail('PATCH')

      await expect(list.toggleFavorite(list.projects.value[0]!)).rejects.toThrow()

      expect(list.projects.value[0]!.favorite).toBe(false)
    })

    it('drops an unfavorited project from the favorites list without skipping the next page', async () => {
      api = fakeProjectsApi(Array.from({ length: 12 }, () => ({ favorite: true })))
      const list = await loadedList({ favorite: true })

      await list.toggleFavorite(list.projects.value[0]!)
      expect(list.total.value).toBe(11)
      await list.loadMore()

      expect(list.projects.value.map(p => p.name)).toEqual(api.db.slice(1).map(p => p.name))
    })
  })

  describe('remove', () => {
    it('deletes the project and keeps the following pages intact', async () => {
      api = fakeProjectsApi(Array.from({ length: 12 }, () => ({})))
      const list = await loadedList()
      const [removed] = list.projects.value

      await list.remove(removed!)
      await list.loadMore()

      expect(list.total.value).toBe(11)
      expect(list.projects.value.map(p => p.name)).toEqual(api.db.map(p => p.name))
      expect(list.projects.value).not.toContainEqual(removed)
    })

    it('keeps the project when the API fails', async () => {
      api = fakeProjectsApi([{}])
      const list = await loadedList()
      api.fail('DELETE')

      await expect(list.remove(list.projects.value[0]!)).rejects.toThrow()

      expect(list.projects.value).toHaveLength(1)
      expect(list.total.value).toBe(1)
    })
  })
})
