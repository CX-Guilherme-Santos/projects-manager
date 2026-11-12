<script setup lang="ts">
import { projectsService } from '~/services/projects'

useHead({ title: 'Novo projeto · Gerenciador de Projetos' })

const { create } = projectsService()
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <BaseBackLink />
      <h1>Novo projeto</h1>
    </div>

    <section class="form-panel">
      <ProjectForm
        :save="create"
        @saved="navigateTo('/')"
      />
    </section>
  </div>
</template>
