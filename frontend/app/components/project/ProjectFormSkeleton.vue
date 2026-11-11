<template>
  <div
    class="form-skeleton"
    role="status"
    aria-label="Carregando projeto"
  >
    <div
      v-for="field in ['name', 'client']"
      :key="field"
      class="form-skeleton__field"
    >
      <span class="skeleton form-skeleton__label" />
      <span class="skeleton form-skeleton__input" />
    </div>
    <div class="form-skeleton__dates">
      <div
        v-for="field in ['start', 'end']"
        :key="field"
        class="form-skeleton__field"
      >
        <span class="skeleton form-skeleton__label" />
        <span class="skeleton form-skeleton__input" />
      </div>
    </div>
    <div class="form-skeleton__field">
      <span class="skeleton form-skeleton__label" />
      <span class="skeleton form-skeleton__cover" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// Same grid as ProjectForm, so nothing jumps when the project arrives
.form-skeleton {
  display: grid;
  gap: 32px;
  width: min(704px, 100%);
  margin: 0 auto;
}

.form-skeleton__field {
  display: grid;
  gap: 8px;
}

.form-skeleton__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.form-skeleton__label {
  width: 180px;
  height: 20px;
}

.form-skeleton__input {
  height: 40px;
}

.form-skeleton__cover {
  aspect-ratio: 702 / 395;
}

@media (max-width: 575.98px) {
  .form-skeleton__dates {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
