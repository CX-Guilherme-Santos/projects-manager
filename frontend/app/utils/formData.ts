import type { ProjectFormValues } from '../schemas/project'

// Multipart body for POST/PATCH /projects (the cover is a file upload)
export function toProjectFormData(values: ProjectFormValues, { removeCover = false } = {}): FormData {
  const data = new FormData()
  data.append('project[name]', values.name.trim())
  data.append('project[client]', values.client.trim())
  data.append('project[start_date]', values.start_date)
  data.append('project[end_date]', values.end_date)

  if (values.cover) data.append('project[cover]', values.cover)
  else if (removeCover) data.append('project[remove_cover]', 'true')

  return data
}
