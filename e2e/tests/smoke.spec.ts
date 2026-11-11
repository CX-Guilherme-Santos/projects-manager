import { expect, test } from '@playwright/test'

test('frontend renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Gerenciador de Projetos' })).toBeVisible()
})

test('api is up', async ({ request }) => {
  const response = await request.get('http://localhost:3000/up')
  expect(response.ok()).toBeTruthy()
})
