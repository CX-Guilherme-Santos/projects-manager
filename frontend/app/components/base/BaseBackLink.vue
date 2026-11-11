<script setup lang="ts">
const { to = '/' } = defineProps<{ to?: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="back-link d-inline-flex align-items-center gap-2 text-decoration-none"
  >
    <Icon
      name="ph:arrow-left-light"
      size="18"
    />
    Voltar
  </NuxtLink>
</template>

<style scoped lang="scss">
.back-link {
  color: var(--pm-primary);

  &:hover {
    text-decoration: underline;
  }
}
</style>
