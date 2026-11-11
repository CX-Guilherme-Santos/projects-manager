// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@vee-validate/nuxt', '@nuxt/eslint'],

  // SPA: all data comes from the Rails API, so `nuxt generate` outputs a static
  // site for Cloudflare Pages (no Node server in production)
  ssr: false,
  devtools: { enabled: true },

  css: ['~/assets/scss/main.scss'],

  runtimeConfig: {
    public: {
      // override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:3000',
    },
  },

  // Same output locally and on Cloudflare Pages (which auto-detects this preset anyway):
  // `nuxt generate` writes to dist/ with a _headers file for long-term asset caching
  nitro: {
    preset: 'cloudflare-pages-static',
  },

  // Used by `nuxt generate` (the Cloudflare build)
  $production: {
    runtimeConfig: {
      public: {
        apiBase: 'https://projects-manager-api-499ef87f8334.herokuapp.com',
      },
    },
  },

  // Rails runs on 3000, so Nuxt uses 3001
  devServer: { port: 3001 },
  compatibilityDate: '2025-07-15',

  vite: {
    css: {
      preprocessorOptions: {
        // Bootstrap 5.3 still uses @import and global Sass functions
        scss: {
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
        },
      },
    },
  },

  // Type-check plain unit tests too (test/nuxt is already covered by Nuxt)
  typescript: {
    nodeTsConfig: {
      include: ['../test/unit/**/*'],
    },
  },

  // ESLint also handles formatting (no Prettier): 2 spaces, single quotes, no semicolons
  eslint: {
    config: { stylistic: true },
  },
})
