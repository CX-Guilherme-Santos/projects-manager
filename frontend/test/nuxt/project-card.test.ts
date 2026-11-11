import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { buildProject } from './support/fakeApi'
import ProjectCard from '~/components/project/ProjectCard.vue'

describe('ProjectCard', () => {
  it('shows the project with the dates written out', async () => {
    const card = await mountSuspended(ProjectCard, {
      props: { project: buildProject({ name: 'Projeto 01', client: 'Clicksign' }) },
    })

    expect(card.get('h2').text()).toBe('Projeto 01')
    expect(card.text()).toContain('Cliente: Clicksign')
    expect(card.text()).toContain('01 de setembro de 2024')
    expect(card.text()).toContain('12 de dezembro de 2024')
  })

  it('asks to toggle the favorite from the star, which reflects the current state', async () => {
    const card = await mountSuspended(ProjectCard, { props: { project: buildProject({ favorite: true }) } })
    const star = card.get('button[aria-label="Remover dos favoritos"]')

    await star.trigger('click')

    expect(star.attributes('aria-pressed')).toBe('true')
    expect(card.emitted('toggleFavorite')).toHaveLength(1)
  })

  it('highlights the searched term in the name and the client, as text', async () => {
    const card = await mountSuspended(ProjectCard, {
      props: {
        project: buildProject({ name: 'Projeto <b>Acme</b>', client: 'Acme Corp' }),
        highlight: 'acme',
      },
    })

    expect(card.findAll('mark').map(mark => mark.text())).toEqual(['Acme', 'Acme'])
    expect(card.find('b').exists()).toBe(false)
  })

  describe('options menu', () => {
    async function openMenu() {
      const card = await mountSuspended(ProjectCard, { props: { project: buildProject({ id: 7 }) } })
      await card.get('button[aria-label="Opções do projeto"]').trigger('click')
      return card
    }

    it('links to the edit page', async () => {
      const card = await openMenu()

      const edit = card.get('[role="menuitem"][href]')
      expect(edit.text()).toBe('Editar')
      expect(edit.attributes('href')).toBe('/projects/7/edit')
    })

    it('asks to remove the project and closes', async () => {
      const card = await openMenu()

      await card.get('button[role="menuitem"]').trigger('click')

      expect(card.emitted('remove')).toHaveLength(1)
      expect(card.find('[role="menu"]').exists()).toBe(false)
    })
  })
})
