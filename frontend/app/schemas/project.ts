import { z } from 'zod'

// Same rules and messages as backend/app/models/project.rb and config/locales/pt-BR.yml.
// The API stays the source of truth: its 422 errors are shown in the same fields.
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

// Project::TEXT_MAX_LENGTH in the API
export const TEXT_MAX_LENGTH = 100
const TOO_LONG = `Use no máximo ${TEXT_MAX_LENGTH} caracteres`

export const COVER_TYPES = ['image/jpeg', 'image/png']
export const COVER_MAX_MB = 5

// BaseDateInput yields "YYYY-MM-DD", or "" while the typed date is incomplete
const INVALID_DATE = 'Selecione uma data válida'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const isoDate = z.string({ required_error: INVALID_DATE }).regex(ISO_DATE, INVALID_DATE)

export const projectSchema = z.object({
  name: z.string().max(TEXT_MAX_LENGTH, TOO_LONG).refine(value => words(value) >= 2, 'Por favor, digite ao menos duas palavras'),
  client: z.string().max(TEXT_MAX_LENGTH, TOO_LONG).refine(value => words(value) >= 1, 'Por favor, digite ao menos uma palavra'),
  start_date: isoDate,
  end_date: isoDate,
  // Optional: null keeps the current cover (or none)
  cover: z.instanceof(File).nullable()
    .refine(file => !file || COVER_TYPES.includes(file.type), 'Escolha uma imagem .jpg ou .png')
    .refine(file => !file || file.size <= COVER_MAX_MB * 1024 * 1024, `A imagem deve ter no máximo ${COVER_MAX_MB} MB`),
}).superRefine((values, ctx) => {
  const bothDates = ISO_DATE.test(values.start_date) && ISO_DATE.test(values.end_date)
  // ISO dates compare correctly as strings
  if (bothDates && values.end_date <= values.start_date) {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'Selecione uma data posterior à data de início' })
  }
})

export type ProjectFormValues = z.infer<typeof projectSchema>
