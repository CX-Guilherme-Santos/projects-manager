// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@vee-validate/nuxt', '@nuxt/eslint', '@nuxt/icon', '@vueuse/nuxt'],

  // Used by `nuxt generate` (the Cloudflare build)
  $production: {
    runtimeConfig: {
      public: {
        apiBase: 'https://projects-manager-api-499ef87f8334.herokuapp.com',
      },
    },
  },

  // SPA: all data comes from the Rails API, so `nuxt generate` outputs a static
  // site for Cloudflare Pages (no Node server in production)
  ssr: false,
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Gerenciador de Projetos',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        // Font from the Figma design
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Encode+Sans+Semi+Expanded:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/scss/main.scss'],

  runtimeConfig: {
    public: {
      // override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:3000',
    },
  },

  // Rails runs on 3000, so Nuxt uses 3001
  devServer: { port: 3001 },
  compatibilityDate: '2025-07-15',

  // Same output locally and on Cloudflare Pages (which auto-detects this preset anyway):
  // `nuxt generate` writes to dist/ with a _headers file for long-term asset caching
  nitro: {
    preset: 'cloudflare-pages-static',
  },

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

  // Icons are bundled into the client (static site): no runtime requests to the Iconify API.
  // Only icons used in the code are included, scanned from the source files.
  icon: {
    provider: 'none',
    clientBundle: { scan: true },
  },
})
