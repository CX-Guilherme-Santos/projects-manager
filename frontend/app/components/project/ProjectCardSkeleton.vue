<template>
  <div
    class="card-skeleton"
    aria-hidden="true"
  >
    <div class="card-skeleton__cover shimmer" />
    <div class="card-skeleton__body">
      <span class="shimmer card-skeleton__line card-skeleton__line--title" />
      <span class="shimmer card-skeleton__line card-skeleton__line--short" />
      <hr>
      <span class="shimmer card-skeleton__line" />
      <span class="shimmer card-skeleton__line" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-skeleton {
  height: 430px;
  border: 1px solid var(--pm-border);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.card-skeleton__cover {
  height: 232px;
}

.card-skeleton__body {
  display: grid;
  gap: 12px;
  padding: 24px;

  hr {
    margin: 4px 0;
    border-color: var(--pm-divider);
    opacity: 1;
  }
}

.card-skeleton__line {
  display: block;
  width: 70%;
  height: 16px;
  border-radius: 4px;
}

.card-skeleton__line--title {
  width: 55%;
  height: 24px;
}

.card-skeleton__line--short {
  width: 45%;
}

.shimmer {
  background: linear-gradient(90deg, #ece9fb 25%, #f7f6ff 50%, #ece9fb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
  }
}
</style>
