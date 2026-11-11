<script setup lang="ts">
defineProps<{ title: string, description: string }>()
</script>

<template>
  <section class="empty-state flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center bg-white">
    <h2 class="empty-state__title mb-4">
      {{ title }}
    </h2>
    <p class="empty-state__text">
      {{ description }}
    </p>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.empty-state {
  min-height: 420px;
  padding: 48px 16px;
  border-radius: 4px;
}

.empty-state__title {
  font-size: 1.5rem;
}

.empty-state__text {
  margin: 0 0 32px;
  color: var(--pm-gray);
}
</style>
