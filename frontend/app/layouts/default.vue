<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 60px var(--pm-page-padding-x) 48px;
}

@media (max-width: 767.98px) {
  .app__main {
    padding-top: 32px;
  }
}
</style>
