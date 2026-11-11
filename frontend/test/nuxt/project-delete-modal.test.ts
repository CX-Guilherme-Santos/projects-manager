import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { buildProject } from './support/fakeApi'
import type { Project } from '~/types/project'
import ProjectDeleteModal from '~/components/project/ProjectDeleteModal.vue'

const mount = (props: { project: Project | null }) =>
  mountSuspended(ProjectDeleteModal, { props, global: { stubs: { teleport: true } } })

describe('ProjectDeleteModal', () => {
  it('names the project and asks for confirmation', async () => {
    const modal = await mount({ project: buildProject({ name: 'Projeto Iridium' }) })

    expect(modal.get('[role="dialog"]').text()).toContain('Essa ação removerá definitivamente o projeto:')
    expect(modal.text()).toContain('Projeto Iridium')

    await modal.get('button.btn-primary').trigger('click')
    expect(modal.emitted('confirm')).toHaveLength(1)
  })

  it('can be cancelled', async () => {
    const modal = await mount({ project: buildProject() })

    await modal.get('button.btn-outline-primary').trigger('click')

    expect(modal.emitted('cancel')).toHaveLength(1)
  })

  it('stays closed without a project', async () => {
    const modal = await mount({ project: null })

    expect(modal.find('[role="dialog"]').exists()).toBe(false)
  })
})
