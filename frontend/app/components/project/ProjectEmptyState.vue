<script setup lang="ts">
defineProps<{ title: string, description: string }>()
</script>

<template>
  <section class="empty-state">
    <h2 class="empty-state__title">
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 48px 16px;
  border-radius: 4px;
  background: #fff;
  text-align: center;
}

.empty-state__title {
  margin: 0 0 24px;
  font-size: 1.5rem;
}

.empty-state__text {
  margin: 0 0 32px;
  color: var(--pm-gray);
}
</style>
