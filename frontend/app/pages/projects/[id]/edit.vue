<script setup lang="ts">
import { projectsService } from '~/services/projects'
import type { Project } from '~/types/project'

useHead({ title: 'Editar projeto · Gerenciador de Projetos' })

const route = useRoute()
const service = projectsService()
const id = Number(route.params.id)

const project = ref<Project | null>(null)
const failed = ref(false)

onMounted(async () => {
  try {
    project.value = await service.get(id)
  }
  catch (error) {
    if ((error as { status?: number }).status === 404) await navigateTo('/', { replace: true })
    else failed.value = true
  }
})

const save = (body: FormData) => service.update(id, body)
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <BaseBackLink />
      <h1>Editar projeto</h1>
    </div>

    <section class="form-panel">
      <ProjectForm
        v-if="project"
        :project="project"
        :save="save"
        @saved="navigateTo('/')"
      />
      <p
        v-else-if="failed"
        class="text-center text-danger m-0"
        role="alert"
      >
        Não foi possível carregar o projeto.
      </p>
      <div
        v-else
        class="form-skeleton"
        aria-busy="true"
        aria-label="Carregando projeto"
      >
        <span
          v-for="n in 4"
          :key="n"
          class="form-skeleton__field"
        />
        <span class="form-skeleton__cover" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.form-skeleton {
  display: grid;
  gap: 32px;
  width: min(704px, 100%);
  margin: 0 auto;
}

.form-skeleton__field,
.form-skeleton__cover {
  display: block;
  height: 72px;
  border-radius: 4px;
  background: linear-gradient(90deg, #ece9fb 25%, #f7f6ff 50%, #ece9fb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.form-skeleton__cover {
  height: 240px;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
