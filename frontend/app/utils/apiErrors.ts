// 422 from the API: { errors: { name: ["Por favor, digite ao menos duas palavras"] } }
// Returns { name: "Por favor, ..." } for VeeValidate's setErrors, or null for other failures.
export function apiValidationErrors(error: unknown): Record<string, string> | null {
  const { status, data } = (error ?? {}) as { status?: number, data?: { errors?: Record<string, string[]> } }
  if (status !== 422 || !data?.errors) return null

  return Object.fromEntries(
    Object.entries(data.errors).map(([field, messages]) => [field, messages[0] ?? '']),
  )
}
