import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import ProjectForm from '~/components/project/ProjectForm.vue'

const VALID = { name: 'Projeto Iridium', client: 'Clicksign', start_date: '2026-09-01', end_date: '2026-12-12' }

async function fill(form: VueWrapper, values: Partial<typeof VALID>) {
  for (const [field, value] of Object.entries(values)) {
    const input = form.get(`[name="${field}"]`)
    await input.setValue(value)
    await input.trigger('blur')
  }
}

const saveButton = (form: VueWrapper) => form.get('button[type="submit"]')

describe('ProjectForm', () => {
  it('enables "Salvar projeto" only once the form is valid', async () => {
    const form = await mountSuspended(ProjectForm, { props: { save: vi.fn() } })
    await vi.waitFor(() => expect(saveButton(form).attributes()).toHaveProperty('disabled'))

    await fill(form, VALID)

    await vi.waitFor(() => expect(saveButton(form).attributes()).not.toHaveProperty('disabled'))
  })

  it('shows a field error only after the user leaves the field', async () => {
    const form = await mountSuspended(ProjectForm, { props: { save: vi.fn() } })
    const name = form.get('[name="name"]')

    await name.setValue('Iridium')
    expect(form.text()).not.toContain('Por favor, digite ao menos duas palavras')

    await name.trigger('blur')
    await vi.waitFor(() => expect(form.text()).toContain('Por favor, digite ao menos duas palavras'))
    expect(name.attributes('aria-invalid')).toBe('true')
  })

  it('sends the project as multipart and tells the page it was saved', async () => {
    const save = vi.fn().mockResolvedValue({})
    const form = await mountSuspended(ProjectForm, { props: { save } })
    await fill(form, VALID)

    await form.get('form').trigger('submit')

    await vi.waitFor(() => expect(form.emitted('saved')).toHaveLength(1))
    const body: FormData = save.mock.calls[0]![0]
    expect(body.get('project[name]')).toBe('Projeto Iridium')
    expect(body.get('project[end_date]')).toBe('2026-12-12')
  })

  it('shows the errors returned by the API in their fields', async () => {
    const unprocessable = Object.assign(new Error('422'), {
      status: 422,
      data: { errors: { client: ['Cliente bloqueado'] } },
    })
    const form = await mountSuspended(ProjectForm, { props: { save: vi.fn().mockRejectedValue(unprocessable) } })
    await fill(form, VALID)

    await form.get('form').trigger('submit')

    await vi.waitFor(() => expect(form.text()).toContain('Cliente bloqueado'))
    expect(form.emitted('saved')).toBeUndefined()
  })

  it('starts from the project values when editing', async () => {
    const project = { id: 1, ...VALID, favorite: false, cover_url: null, created_at: '', updated_at: '' }
    const form = await mountSuspended(ProjectForm, { props: { save: vi.fn(), project } })

    expect((form.get('[name="name"]').element as HTMLInputElement).value).toBe('Projeto Iridium')
    await vi.waitFor(() => expect(saveButton(form).attributes()).not.toHaveProperty('disabled'))
  })
})
