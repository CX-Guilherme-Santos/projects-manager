<script setup lang="ts">
import type { ProjectSort } from '~/types/project'

definePageMeta({ search: true })
useHead({ title: 'Projetos · Gerenciador de Projetos' })

const SORT_OPTIONS: { value: ProjectSort, label: string }[] = [
  { value: 'name', label: 'Ordem alfabética' },
  { value: 'recent_start', label: 'Iniciados mais recentes' },
  { value: 'nearest_end', label: 'Prazo mais próximo' },
]

// Filters live in the URL: back button, reload and shared links keep them
const route = useRoute()
const router = useRouter()

function setQuery(changes: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...changes } })
}

const sort = computed<ProjectSort>({
  get: () => SORT_OPTIONS.find(option => option.value === route.query.sort)?.value ?? 'name',
  set: value => setQuery({ sort: value === 'name' ? undefined : value }),
})

const favoritesOnly = computed({
  get: () => route.query.favorite === 'true',
  set: value => setQuery({ favorite: value ? 'true' : undefined }),
})

const list = useProjectList(() => ({ sort: sort.value, favorite: favoritesOnly.value }))
const { total, status, projects } = list

// The empty state of the design is for "no projects at all", not for an empty filter
const hasNoProjects = computed(() => status.value === 'ready' && total.value === 0 && !favoritesOnly.value)
const isFirstLoad = computed(() => status.value === 'loading' && projects.value.length === 0)
</script>

<template>
  <div class="page">
    <ProjectEmptyState
      v-if="hasNoProjects"
      title="Nenhum projeto"
      description="Clique no botão abaixo para criar o primeiro e gerenciá-lo."
    >
      <BaseButton
        to="/projects/new"
        size="lg"
        icon="ph:plus-circle-light"
      >
        Novo projeto
      </BaseButton>
    </ProjectEmptyState>

    <template v-else>
      <div class="list-header d-flex flex-wrap align-items-center justify-content-between">
        <h1 class="list-header__title d-flex align-items-baseline gap-2 m-0">
          Projetos
          <span
            v-if="isFirstLoad"
            class="list-header__count-placeholder skeleton"
            aria-hidden="true"
          />
          <span
            v-else
            class="list-header__count fw-normal"
          >({{ total }})</span>
        </h1>
        <div class="list-header__controls d-flex flex-wrap align-items-center">
          <BaseSwitch
            v-model="favoritesOnly"
            label="Apenas Favoritos"
          />
          <BaseSelect
            v-model="sort"
            :options="SORT_OPTIONS"
            label="Ordenar projetos"
          />
          <BaseButton
            to="/projects/new"
            icon="ph:plus-circle-light"
            class="list-header__new"
          >
            Novo projeto
          </BaseButton>
        </div>
      </div>

      <ProjectGrid
        :list="list"
        empty-title="Nenhum projeto favorito"
        empty-description="Marque a estrela de um projeto para vê-lo aqui."
      >
        <template #empty-action>
          <BaseButton
            variant="outline"
            @click="favoritesOnly = false"
          >
            Ver todos os projetos
          </BaseButton>
        </template>
      </ProjectGrid>
    </template>
  </div>
</template>

<style scoped lang="scss">
.list-header {
  gap: 16px 32px;
  margin-bottom: 22px;
}

.list-header__title {
  font-size: 1.5rem;
}

.list-header__count {
  color: var(--pm-primary);
  font-size: 1.125rem;
}

.list-header__count-placeholder {
  width: 32px;
  height: 18px;
}

.list-header__controls {
  gap: 16px 32px;
}

.list-header__new {
  min-width: 184px;
}

@media (max-width: 575.98px) {
  .list-header__controls {
    width: 100%;
  }

  .list-header__new {
    width: 100%;
  }
}
</style>
