<template>
  <div
    class="card-skeleton bg-white overflow-hidden"
    aria-hidden="true"
  >
    <div class="card-skeleton__cover skeleton" />
    <div class="card-skeleton__body d-grid p-4">
      <span class="skeleton card-skeleton__line card-skeleton__line--title" />
      <span class="skeleton card-skeleton__line card-skeleton__line--short" />
      <hr>
      <span class="skeleton card-skeleton__line" />
      <span class="skeleton card-skeleton__line" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-skeleton {
  height: 430px;
  border: 1px solid var(--pm-border);
  border-radius: 16px;
}

.card-skeleton__cover {
  height: 232px;
  border-radius: 0;
}

.card-skeleton__body {
  gap: 12px;

  hr {
    margin: 4px 0;
    border-color: var(--pm-divider);
    opacity: 1;
  }
}

.card-skeleton__line {
  width: 70%;
  height: 16px;
}

.card-skeleton__line--title {
  width: 55%;
  height: 24px;
}

.card-skeleton__line--short {
  width: 45%;
}
</style>
