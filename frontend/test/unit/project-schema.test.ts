import { describe, expect, it } from 'vitest'
import { projectSchema } from '../../app/schemas/project'

const valid = {
  name: 'Projeto Iridium',
  client: 'Clicksign',
  start_date: '2026-09-01',
  end_date: '2026-12-12',
  cover: null as File | null,
}

function errorsFor(values: Partial<typeof valid> & Record<string, unknown>) {
  const result = projectSchema.safeParse({ ...valid, ...values })
  return result.success ? {} : result.error.flatten().fieldErrors
}

describe('projectSchema', () => {
  it('accepts a complete project', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true)
  })

  it('requires at least two words in the name, ignoring extra spaces', () => {
    expect(errorsFor({ name: '  Iridium  ' }).name).toEqual(['Por favor, digite ao menos duas palavras'])
  })

  it('requires at least one word in the client', () => {
    expect(errorsFor({ client: '   ' }).client).toEqual(['Por favor, digite ao menos uma palavra'])
  })

  it('requires both dates', () => {
    const errors = errorsFor({ start_date: '', end_date: '' })

    expect(errors.start_date).toEqual(['Selecione uma data válida'])
    expect(errors.end_date).toEqual(['Selecione uma data válida'])
  })

  it('requires the end date to be after the start date', () => {
    expect(errorsFor({ start_date: '2000-01-01', end_date: '2000-01-01' }).end_date)
      .toEqual(['Selecione uma data posterior à data de início'])
  })

  describe('cover', () => {
    it('accepts jpg and png images', () => {
      for (const type of ['image/jpeg', 'image/png']) {
        expect(errorsFor({ cover: new File(['x'], 'cover', { type }) }).cover).toBeUndefined()
      }
    })

    it('rejects other file types', () => {
      expect(errorsFor({ cover: new File(['x'], 'cover.gif', { type: 'image/gif' }) }).cover)
        .toEqual(['Escolha uma imagem .jpg ou .png'])
    })

    it('rejects images larger than 5 MB', () => {
      const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' })

      expect(errorsFor({ cover: big }).cover).toEqual(['A imagem deve ter no máximo 5 MB'])
    })
  })
})
