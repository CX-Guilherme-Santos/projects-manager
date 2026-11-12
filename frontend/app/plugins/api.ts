// The single HTTP client of the app (the Angular equivalent of a configured HttpClient).
// Services use it through useNuxtApp().$api.
export default defineNuxtPlugin(() => {
  const { apiBase } = useRuntimeConfig().public

  const api = $fetch.create({ baseURL: `${apiBase}/api/v1` })

  return { provide: { api } }
})
