<script setup lang="ts">
defineProps<{ terms: string[] }>()
const emit = defineEmits<{ pick: [term: string], remove: [term: string] }>()
</script>

<template>
  <ul
    class="list-unstyled m-0"
    aria-label="Buscas recentes"
  >
    <li
      v-for="term in terms"
      :key="term"
      class="search-history__item d-flex align-items-center"
    >
      <button
        type="button"
        class="search-history__term flex-grow-1 h-100 d-flex align-items-center border-0 text-start"
        @click="emit('pick', term)"
      >
        <Icon
          name="ph:clock-counter-clockwise-light"
          size="22"
        />
        {{ term }}
      </button>
      <button
        type="button"
        class="search-history__remove h-100 border-0"
        :aria-label="`Remover “${term}” do histórico`"
        @click="emit('remove', term)"
      >
        <Icon
          name="ph:x-light"
          size="22"
        />
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.search-history__item {
  height: 52px;
  border-top: 1px solid var(--pm-bg);
}

.search-history__term {
  gap: 12px;
  padding: 0 20px;
  background: none;
  color: var(--pm-gray);

  &:hover,
  &:focus-visible {
    color: var(--pm-dark);
    background: var(--pm-bg);
  }
}

.search-history__remove {
  padding: 0 20px;
  background: none;
  color: var(--pm-gray);

  &:hover,
  &:focus-visible {
    color: var(--pm-danger);
  }
}
</style>
