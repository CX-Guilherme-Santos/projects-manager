<template>
  <span class="app-logo">
    <img
      src="/logo.svg"
      alt=""
      width="72"
      height="72"
      class="app-logo__mark"
    >
    <span class="app-logo__name">Gerenciador<br>de Projetos</span>
  </span>
</template>

<style scoped lang="scss">
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.app-logo__mark {
  width: 72px;
  height: 72px;
}

.app-logo__name {
  font-size: 1.1875rem;
  line-height: 1.3;
}
</style>
