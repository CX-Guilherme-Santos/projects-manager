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
  <header class="app-header">
    <SearchBar
      v-if="showSearchBar"
      @close="searchOpen = false"
    />
    <div
      v-else
      class="app-header__bar"
    >
      <NuxtLink
        to="/"
        class="app-header__brand"
        aria-label="Gerenciador de Projetos, página inicial"
      >
        <AppLogo />
      </NuxtLink>
      <button
        v-if="canSearch"
        type="button"
        class="app-header__search"
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
  position: sticky;
  top: 0;
  z-index: 1020;
  height: var(--pm-header-height);
}

.app-header__bar {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--pm-dark);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.12);
}

.app-header__brand {
  text-decoration: none;
}

.app-header__search {
  position: absolute;
  right: 60px;
  display: grid;
  place-items: center;
  padding: 6px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: #fff;

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
