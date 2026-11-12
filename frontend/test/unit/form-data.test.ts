import { describe, expect, it } from 'vitest'
import { toProjectFormData } from '../../app/utils/formData'

const values = {
  name: 'Projeto Iridium',
  client: 'Clicksign',
  start_date: '2026-09-01',
  end_date: '2026-12-12',
  cover: null,
}

describe('toProjectFormData', () => {
  it('nests the fields under project[...] like the Rails params expect', () => {
    const data = toProjectFormData(values)

    expect([...data.entries()]).toEqual([
      ['project[name]', 'Projeto Iridium'],
      ['project[client]', 'Clicksign'],
      ['project[start_date]', '2026-09-01'],
      ['project[end_date]', '2026-12-12'],
    ])
  })

  it('sends a new cover file', () => {
    const cover = new File(['x'], 'cover.png', { type: 'image/png' })

    const sent = toProjectFormData({ ...values, cover }).get('project[cover]') as File

    expect(sent.name).toBe('cover.png')
  })

  it('asks to remove the current cover', () => {
    expect(toProjectFormData(values, { removeCover: true }).get('project[remove_cover]')).toBe('true')
  })
})
