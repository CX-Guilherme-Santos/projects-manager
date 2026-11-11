<script setup lang="ts">
import type { Project } from '~/types/project'

// Grid shared by the home and the search results: loading states, infinite scroll,
// favorite toggle and the delete confirmation.
const { list, highlight, emptyTitle, emptyDescription } = defineProps<{
  list: ReturnType<typeof useProjectList>
  highlight?: string
  emptyTitle: string
  emptyDescription: string
}>()

const { projects, status, hasNext, loadingMore } = list

const SKELETONS = 5
const isFirstLoad = computed(() => status.value === 'loading' && projects.value.length === 0)
const isReloading = computed(() => status.value === 'loading' && projects.value.length > 0)

// Infinite scroll: while the sentinel at the end of the grid is near the viewport and
// the list is idle, load the next page. Reactive (not a one-shot observer callback),
// so it also covers a sentinel that was already visible when the first page arrived,
// tall screens that need several pages, and a list refreshed after a removal.
const sentinel = useTemplateRef('sentinel')
const nearEnd = useElementVisibility(sentinel, { rootMargin: '400px' })

watchEffect(() => {
  if (nearEnd.value && hasNext.value && status.value === 'ready' && !loadingMore.value) list.loadMore()
})

const toRemove = ref<Project | null>(null)
const removing = ref(false)
const removeError = ref('')

async function confirmRemove() {
  if (!toRemove.value) return
  removing.value = true
  removeError.value = ''
  try {
    await list.remove(toRemove.value)
    toRemove.value = null
  }
  catch {
    removeError.value = 'Não foi possível remover o projeto. Tente novamente.'
  }
  finally {
    removing.value = false
  }
}

function cancelRemove() {
  toRemove.value = null
  removeError.value = ''
}

async function toggleFavorite(project: Project) {
  // the star rolls back on failure; nothing else to show
  await list.toggleFavorite(project).catch(() => {})
}
</script>

<template>
  <div
    v-if="status === 'error'"
    class="project-grid__error"
    role="alert"
  >
    <p>Não foi possível carregar os projetos.</p>
    <BaseButton
      variant="outline"
      @click="list.load()"
    >
      Tentar novamente
    </BaseButton>
  </div>

  <ProjectEmptyState
    v-else-if="status === 'ready' && projects.length === 0"
    :title="emptyTitle"
    :description="emptyDescription"
  >
    <slot name="empty-action" />
  </ProjectEmptyState>

  <template v-else>
    <ul
      class="project-grid"
      :class="{ 'project-grid--reloading': isReloading }"
      :aria-busy="status === 'loading'"
    >
      <template v-if="isFirstLoad">
        <li
          v-for="n in SKELETONS"
          :key="n"
        >
          <ProjectCardSkeleton />
        </li>
      </template>
      <li
        v-for="project in projects"
        v-else
        :key="project.id"
      >
        <ProjectCard
          :project="project"
          :highlight="highlight"
          @toggle-favorite="toggleFavorite(project)"
          @remove="toRemove = project"
        />
      </li>
    </ul>

    <div
      ref="sentinel"
      class="project-grid__sentinel"
    >
      <span
        v-if="loadingMore"
        class="spinner-border text-primary"
        role="status"
      >
        <span class="visually-hidden">Carregando mais projetos…</span>
      </span>
    </div>
  </template>

  <ProjectDeleteModal
    :project="toRemove"
    :loading="removing"
    :error="removeError"
    @confirm="confirmRemove"
    @cancel="cancelRemove"
  />
</template>

<style scoped lang="scss">
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 34px 32px;
  margin: 0;
  padding: 0;
  list-style: none;
  transition: opacity 0.15s ease;
}

.project-grid--reloading {
  opacity: 0.5;
  pointer-events: none;
}

.project-grid__sentinel {
  display: flex;
  justify-content: center;
  min-height: 1px;
  padding-top: 32px;
}

.project-grid__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
  color: var(--pm-gray);
}
</style>
