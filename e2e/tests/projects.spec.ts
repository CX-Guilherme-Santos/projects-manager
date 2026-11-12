import { COVER_FIXTURE, daysFromToday, expect, test } from './support/fixtures'

// Happy paths through the browser against the real API (Rails in RAILS_ENV=test + Nuxt).
// Selectors use roles and labels only, the way a user (or a screen reader) finds things.

const title = (page: import('@playwright/test').Page) => page.getByRole('heading', { level: 1 })
const card = (page: import('@playwright/test').Page, name: string) => page.getByRole('article').filter({ hasText: name })

test('an empty database shows the empty state', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Nenhum projeto' })).toBeVisible()
  await expect(page.getByText('Clique no botão abaixo para criar o primeiro e gerenciá-lo.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Novo projeto' })).toBeVisible()
})

test('creates a project with a cover through the form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Novo projeto' }).click()

  await expect(page.getByRole('heading', { name: 'Novo projeto' })).toBeVisible()
  await page.getByLabel('Nome do projeto').fill('Projeto Iridium')
  await page.getByLabel('Cliente').fill('Clicksign')
  await page.getByLabel('Data de Início').fill('01/09/2026')
  await page.getByLabel('Data Final').fill('12/12/2026')
  await page.getByLabel('Capa do projeto').setInputFiles(COVER_FIXTURE)
  await expect(page.getByRole('img', { name: 'Capa do projeto' })).toBeVisible() // preview
  await page.getByRole('button', { name: 'Salvar projeto' }).click()

  await expect(page).toHaveURL('/')
  await expect(title(page)).toHaveText('Projetos (1)')
  const cover = card(page, 'Projeto Iridium').getByRole('img', { name: 'Capa do projeto Projeto Iridium' })
  await expect(cover).toBeVisible()
  await expect(cover).toHaveJSProperty('complete', true)
  expect(await cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  await expect(card(page, 'Projeto Iridium')).toContainText('01 de setembro de 2026')
})

test('shows field errors and keeps "Salvar projeto" disabled for invalid data', async ({ page }) => {
  await page.goto('/projects/new')

  await page.getByLabel('Nome do projeto').fill('Iridium')
  await page.getByLabel('Nome do projeto').press('Tab')
  await page.getByLabel('Cliente').fill('   ')
  await page.getByLabel('Cliente').press('Tab')
  await page.getByLabel('Data de Início').fill('01/01/2000')
  await page.getByLabel('Data de Início').press('Tab')
  await page.getByLabel('Data Final').fill('01/01/2000')
  await page.getByLabel('Data Final').press('Tab')

  await expect(page.getByText('Por favor, digite ao menos duas palavras')).toBeVisible()
  await expect(page.getByText('Por favor, digite ao menos uma palavra')).toBeVisible()
  await expect(page.getByText('Selecione uma data posterior à data de início')).toBeVisible()
  await expect(page.getByLabel('Nome do projeto')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('button', { name: 'Salvar projeto' })).toBeDisabled()
})

test('favorites a project and filters the list by favorites', async ({ page, createProject }) => {
  await createProject({ name: 'Projeto Alfa' })
  await createProject({ name: 'Projeto Beta' })
  await page.goto('/')

  await card(page, 'Projeto Beta').getByRole('button', { name: 'Adicionar aos favoritos' }).click()
  await expect(card(page, 'Projeto Beta').getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('switch', { name: 'Apenas Favoritos' }).check()

  await expect(page).toHaveURL(/favorite=true/)
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(card(page, 'Projeto Beta')).toBeVisible()
  // the title keeps the number of registered projects
  await expect(title(page)).toHaveText('Projetos (2)')
})

test('sorts by the nearest deadline', async ({ page, createProject }) => {
  await createProject({ name: 'Alfa projeto', end_date: daysFromToday(30) })
  await createProject({ name: 'Beta projeto', start_date: daysFromToday(-60), end_date: daysFromToday(-5) }) // finished
  await createProject({ name: 'Gama projeto', end_date: daysFromToday(10) })
  await page.goto('/')
  const names = page.getByRole('article').getByRole('heading', { level: 2 })
  await expect(names).toHaveText(['Alfa projeto', 'Beta projeto', 'Gama projeto'])

  await page.getByRole('combobox', { name: 'Ordenar projetos' }).click()
  await page.getByRole('option', { name: 'Prazo mais próximo' }).click()

  await expect(page).toHaveURL(/\?sort=nearest_end/)
  // running projects by end date, finished ones last
  await expect(names).toHaveText(['Gama projeto', 'Alfa projeto', 'Beta projeto'])
})

test('searches with 3+ characters, highlights the match and keeps the term in the history', async ({ page, createProject }) => {
  await createProject({ name: 'Projeto Iridium' })
  await createProject({ name: 'Projeto Xenon' })
  await page.goto('/')

  await page.getByRole('button', { name: 'Buscar projetos' }).click()
  await page.getByRole('searchbox', { name: 'Buscar projetos por nome ou cliente' }).fill('Iridium')

  await expect(page).toHaveURL('/search?q=Iridium')
  await expect(page.getByRole('heading', { name: 'Resultado da busca' })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(1)
  // the matched part is its own <mark> element ("Projeto " stays plain text)
  await expect(card(page, 'Projeto Iridium').getByText('Iridium', { exact: true })).toHaveJSProperty('tagName', 'MARK')

  await page.getByRole('link', { name: 'Voltar' }).click()
  await page.getByRole('button', { name: 'Buscar projetos' }).click()
  await expect(page.getByRole('list', { name: 'Buscas recentes' }).getByRole('button', { name: 'Iridium', exact: true })).toBeVisible()
})

test('edits the name and removes the cover', async ({ page }) => {
  // created through the form, so it has a cover to remove
  await page.goto('/projects/new')
  await page.getByLabel('Nome do projeto').fill('Projeto Iridium')
  await page.getByLabel('Cliente').fill('Clicksign')
  await page.getByLabel('Data de Início').fill('01/09/2026')
  await page.getByLabel('Data Final').fill('12/12/2026')
  await page.getByLabel('Capa do projeto').setInputFiles(COVER_FIXTURE)
  await page.getByRole('button', { name: 'Salvar projeto' }).click()
  await expect(title(page)).toHaveText('Projetos (1)')

  await card(page, 'Projeto Iridium').getByRole('button', { name: 'Opções do projeto' }).click()
  await page.getByRole('menuitem', { name: 'Editar' }).click()
  await expect(page.getByRole('heading', { name: 'Editar projeto' })).toBeVisible()
  await page.getByLabel('Nome do projeto').fill('Projeto Renomeado')
  await page.getByRole('button', { name: 'Remover capa' }).click()
  await page.getByRole('button', { name: 'Salvar projeto' }).click()

  await expect(page).toHaveURL('/')
  await expect(card(page, 'Projeto Renomeado')).toBeVisible()
  await expect(card(page, 'Projeto Iridium')).toHaveCount(0)
  await expect(page.getByRole('img', { name: /^Capa do projeto/ })).toHaveCount(0)
})

test('removes a project through the confirmation modal', async ({ page, createProject }) => {
  await createProject({ name: 'Projeto Iridium' })
  await page.goto('/')

  await card(page, 'Projeto Iridium').getByRole('button', { name: 'Opções do projeto' }).click()
  await page.getByRole('menuitem', { name: 'Remover' }).click()
  const dialog = page.getByRole('dialog', { name: 'Remover projeto' })
  await expect(dialog).toContainText('Projeto Iridium')
  await dialog.getByRole('button', { name: 'Confirmar' }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Nenhum projeto' })).toBeVisible()
})
