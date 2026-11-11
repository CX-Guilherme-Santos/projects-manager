<script setup lang="ts">
const { to = '/' } = defineProps<{ to?: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="back-link"
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--pm-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
