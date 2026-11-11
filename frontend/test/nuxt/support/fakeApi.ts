import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { type H3Event, getQuery, readBody, setResponseHeader, setResponseStatus } from 'h3'
import type { Project } from '~/types/project'

const API = 'http://localhost:3000/api/v1'
const PAGE_SIZE = 10

function serverError(event: H3Event) {
  setResponseStatus(event, 500)
  return { error: 'Internal Server Error' }
}

export function buildProject(attributes: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Projeto Iridium',
    client: 'Clicksign',
    start_date: '2024-09-01',
    end_date: '2024-12-12',
    favorite: false,
    cover_url: null,
    created_at: '2024-08-01T10:00:00-03:00',
    updated_at: '2024-08-01T10:00:00-03:00',
    ...attributes,
  }
}

// In-memory stand-in for the Rails API: same pagination headers, favorite filter,
// PATCH and DELETE. Tests assert on what the composables expose, not on these calls.
export function fakeProjectsApi(seed: Partial<Project>[]) {
  const db = seed.map((attributes, i) => buildProject({ id: i + 1, name: `Projeto ${i + 1}`, ...attributes }))
  const failing = new Set<string>()
  const latency = { unfiltered: 0 }
  const cleanups: (() => void)[] = []

  cleanups.push(registerEndpoint(`${API}/projects`, async (event) => {
    const query = getQuery(event)
    if (query.favorite !== 'true' && latency.unfiltered) await new Promise(r => setTimeout(r, latency.unfiltered))
    const page = Number(query.page ?? 1)
    const rows = query.favorite === 'true' ? db.filter(p => p.favorite) : db
    const hasNext = page * PAGE_SIZE < rows.length

    setResponseHeader(event, 'total-count', String(rows.length))
    setResponseHeader(event, 'page-limit', String(PAGE_SIZE))
    setResponseHeader(event, 'link', hasNext ? `<${API}/projects?page=${page + 1}>; rel="next"` : '')
    return rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }))

  for (const project of db) {
    const url = `${API}/projects/${project.id}`
    cleanups.push(registerEndpoint(url, {
      method: 'PATCH',
      handler: async (event) => {
        if (failing.has('PATCH')) return serverError(event)
        const { project: changes } = await readBody(event)
        Object.assign(project, changes)
        return project
      },
    }))
    cleanups.push(registerEndpoint(url, {
      method: 'DELETE',
      handler: (event) => {
        if (failing.has('DELETE')) return serverError(event)
        db.splice(db.indexOf(project), 1)
        event.node.res.statusCode = 204
        return null
      },
    }))
  }

  return {
    db,
    // makes requests without the favorite filter answer late (out-of-order responses)
    slowUnfiltered: (ms: number) => { latency.unfiltered = ms },
    fail: (method: 'PATCH' | 'DELETE') => failing.add(method),
    restore: () => cleanups.forEach(cleanup => cleanup()),
  }
}
