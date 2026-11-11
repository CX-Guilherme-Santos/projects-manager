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
      <ProjectFormSkeleton v-else />
    </section>
  </div>
</template>
