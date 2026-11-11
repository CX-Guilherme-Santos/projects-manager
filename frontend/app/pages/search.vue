<script setup lang="ts">
definePageMeta({ search: true })
useHead({ title: 'Resultado da busca · Gerenciador de Projetos' })

const route = useRoute()
const term = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))

// The header only navigates here with 3+ characters; a hand-typed URL may not
if (!isSearchable(term.value)) await navigateTo('/', { replace: true })

const list = useProjectList(() => ({ q: term.value }))
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <BaseBackLink />
      <h1>Resultado da busca</h1>
    </div>

    <ProjectGrid
      :list="list"
      :highlight="term"
      empty-title="Nenhum projeto encontrado"
      :empty-description="`Nenhum projeto ou cliente corresponde a “${term}”.`"
    />
  </div>
</template>
