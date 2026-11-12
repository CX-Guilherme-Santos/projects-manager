import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Plain functions, schemas, utils: fast, no Nuxt runtime
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // Components and composables that need Nuxt (auto-imports, runtimeConfig, router)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          // The persistent transform cache does not notice new auto-imports (a new
          // composable stays "not defined" in tests until the cache is cleared)
          fsModuleCache: false,
          environmentOptions: {
            nuxt: { domEnvironment: 'happy-dom' },
          },
        },
      }),
    ],
  },
})
