<script setup lang="ts">
defineProps<{ terms: string[] }>()
const emit = defineEmits<{ pick: [term: string], remove: [term: string] }>()
</script>

<template>
  <ul
    class="search-history"
    aria-label="Buscas recentes"
  >
    <li
      v-for="term in terms"
      :key="term"
      class="search-history__item"
    >
      <button
        type="button"
        class="search-history__term"
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
        class="search-history__remove"
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
.search-history {
  margin: 0;
  padding: 0;
  list-style: none;
}

.search-history__item {
  display: flex;
  align-items: center;
  height: 52px;
  border-top: 1px solid var(--pm-bg);
}

.search-history__term {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border: 0;
  background: none;
  color: var(--pm-gray);
  text-align: left;

  &:hover,
  &:focus-visible {
    color: var(--pm-dark);
    background: var(--pm-bg);
  }
}

.search-history__remove {
  height: 100%;
  padding: 0 20px;
  border: 0;
  background: none;
  color: var(--pm-gray);

  &:hover,
  &:focus-visible {
    color: var(--pm-danger);
  }
}
</style>
