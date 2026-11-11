<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />
    <main class="app__main flex-grow-1 d-flex flex-column">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app__main {
  padding: 60px var(--pm-page-padding-x) 48px;
}

@media (max-width: 767.98px) {
  .app__main {
    padding-top: 32px;
  }
}
</style>
