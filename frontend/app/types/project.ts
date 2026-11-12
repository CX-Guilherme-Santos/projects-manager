// Mirrors Api::V1::ProjectSerializer
export interface Project {
  id: number
  name: string
  client: string
  start_date: string
  end_date: string
  favorite: boolean
  cover_url: string | null
  created_at: string
  updated_at: string
}

export type ProjectSort = 'name' | 'recent_start' | 'nearest_end'

export interface ProjectListQuery {
  sort?: ProjectSort
  favorite?: boolean
  q?: string
  page?: number
}

export interface ProjectPage {
  projects: Project[]
  total: number
  limit: number
  hasNext: boolean
}
