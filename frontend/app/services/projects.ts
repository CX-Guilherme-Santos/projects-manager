import type { Project, ProjectListQuery, ProjectPage } from '~/types/project'

// Calls to /api/v1/projects. No state here: composables and pages own the state.
export function projectsService() {
  const { $api } = useNuxtApp()

  return {
    // Pagination comes in the headers (RFC 8288 Link + total-count), the body is a plain array
    async list({ favorite, ...query }: ProjectListQuery = {}): Promise<ProjectPage> {
      const response = await $api.raw<Project[]>('/projects', {
        query: { ...query, favorite: favorite || undefined },
      })

      return {
        projects: response._data ?? [],
        total: Number(response.headers.get('total-count') ?? 0),
        limit: Number(response.headers.get('page-limit') ?? 10),
        hasNext: response.headers.get('link')?.includes('rel="next"') ?? false,
      }
    },

    get: (id: number | string) => $api<Project>(`/projects/${id}`),

    create: (body: FormData) => $api<Project>('/projects', { method: 'POST', body }),

    update: (id: number, body: FormData | { project: Partial<Project> }) =>
      $api<Project>(`/projects/${id}`, { method: 'PATCH', body }),

    remove: (id: number) => $api(`/projects/${id}`, { method: 'DELETE' }),
  }
}
