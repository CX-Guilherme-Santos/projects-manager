<script setup lang="ts">
const route = useRoute()
const searchOpen = ref(false)

const canSearch = computed(() => route.meta.search === true)
// On the results page the search bar stays open with the current term
const showSearchBar = computed(() => canSearch.value && (searchOpen.value || route.path === '/search'))

watch(() => route.path, () => {
  searchOpen.value = false
})
</script>

<template>
  <header class="app-header sticky-top">
    <SearchBar
      v-if="showSearchBar"
      @close="searchOpen = false"
    />
    <div
      v-else
      class="app-header__bar position-relative h-100 d-flex align-items-center justify-content-center"
    >
      <NuxtLink
        to="/"
        class="text-decoration-none"
        aria-label="Gerenciador de Projetos, página inicial"
      >
        <AppLogo />
      </NuxtLink>
      <button
        v-if="canSearch"
        type="button"
        class="app-header__search position-absolute d-grid border-0 rounded-circle text-white"
        aria-label="Buscar projetos"
        @click="searchOpen = true"
      >
        <Icon
          name="ph:magnifying-glass-light"
          size="28"
        />
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  height: var(--pm-header-height);
}

.app-header__bar {
  background: var(--pm-dark);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.12);
}

.app-header__search {
  right: 60px;
  place-items: center;
  padding: 6px;
  background: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

@media (max-width: 767.98px) {
  .app-header__search {
    right: 16px;
  }

  :deep(.app-logo__name) {
    font-size: 1rem;
  }
}
</style>
