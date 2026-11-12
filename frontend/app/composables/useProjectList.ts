import { projectsService } from '~/services/projects'
import type { Project, ProjectListQuery } from '~/types/project'

type ListStatus = 'loading' | 'ready' | 'error'

// State of a paginated project list (home and search results).
// Reloads from page 1 whenever the query (sort, favorite filter, search term) changes.
export function useProjectList(query: MaybeRefOrGetter<ProjectListQuery>) {
  const service = projectsService()

  const projects = ref<Project[]>([])
  const total = ref(0)
  const hasNext = ref(false)
  const status = ref<ListStatus>('loading')
  const page = ref(1)
  const loadingMore = ref(false)
  const limit = ref(10)

  // Each load gets a number: a slower response from an older query is discarded
  let latestLoad = 0

  async function load() {
    const current = ++latestLoad
    status.value = 'loading'
    try {
      const result = await service.list({ ...toValue(query), page: 1 })
      if (current !== latestLoad) return
      page.value = 1
      limit.value = result.limit
      projects.value = result.projects
      total.value = result.total
      hasNext.value = result.hasNext
      status.value = 'ready'
    }
    catch {
      if (current === latestLoad) status.value = 'error'
    }
  }

  async function loadMore() {
    if (loadingMore.value || !hasNext.value || status.value !== 'ready') return

    const current = latestLoad
    loadingMore.value = true
    try {
      const result = await service.list({ ...toValue(query), page: page.value + 1 })
      if (current !== latestLoad) return
      page.value += 1
      projects.value.push(...result.projects)
      total.value = result.total
      hasNext.value = result.hasNext
    }
    finally {
      loadingMore.value = false
    }
  }

  // Offset pagination shifts every row after a removed one, so the pages already shown
  // are fetched again: the next loadMore then continues from the right row.
  async function refresh() {
    const pages = Math.max(1, Math.min(page.value, Math.ceil(total.value / limit.value)))
    const results = await Promise.all(
      Array.from({ length: pages }, (_, i) => service.list({ ...toValue(query), page: i + 1 })),
    )
    const last = results.at(-1)!
    page.value = pages
    projects.value = results.flatMap(result => result.projects)
    total.value = last.total
    hasNext.value = last.hasNext
  }

  async function drop(project: Project) {
    projects.value = projects.value.filter(p => p.id !== project.id)
    total.value -= 1
    await refresh()
  }

  async function toggleFavorite(project: Project) {
    const favorite = !project.favorite
    project.favorite = favorite // optimistic: the star changes right away
    try {
      await service.update(project.id, { project: { favorite } })
    }
    catch (error) {
      project.favorite = !favorite
      throw error
    }
    if (!favorite && toValue(query).favorite) await drop(project)
  }

  // Not optimistic: the confirmation modal waits for the API before closing
  async function remove(project: Project) {
    await service.remove(project.id)
    await drop(project)
  }

  watch(() => toValue(query), load, { immediate: true, deep: true })

  return { projects, total, hasNext, status, loadingMore, load, loadMore, toggleFavorite, remove }
}
