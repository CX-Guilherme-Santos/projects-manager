<script setup lang="ts">
const { projectId } = defineProps<{ projectId: number }>()
const emit = defineEmits<{ remove: [] }>()

const open = ref(false)
const root = useTemplateRef('root')
const menuId = useId()

onClickOutside(root, () => (open.value = false))

function remove() {
  open.value = false
  emit('remove')
}
</script>

<template>
  <div
    ref="root"
    class="position-relative"
    @keydown.esc="open = false"
  >
    <button
      type="button"
      class="card-menu__trigger d-grid p-0 border-0 rounded-circle bg-white"
      aria-label="Opções do projeto"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="open = !open"
    >
      <Icon
        name="ph:dots-three-bold"
        size="20"
      />
    </button>
    <div
      v-if="open"
      :id="menuId"
      class="card-menu__list position-absolute end-0 bg-white"
      role="menu"
    >
      <NuxtLink
        :to="`/projects/${projectId}/edit`"
        class="card-menu__item position-relative d-flex align-items-center w-100 text-decoration-none"
        role="menuitem"
      >
        <Icon
          name="ph:pencil-simple-line-light"
          size="24"
        />Editar
      </NuxtLink>
      <button
        type="button"
        class="card-menu__item position-relative d-flex align-items-center w-100 text-start"
        role="menuitem"
        @click="remove"
      >
        <Icon
          name="ph:trash-light"
          size="24"
        />Remover
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-menu__trigger {
  width: 32px;
  height: 32px;
  place-items: center;
  color: var(--pm-primary);
  box-shadow: var(--pm-shadow);
}

.card-menu__list {
  top: calc(100% + 8px);
  z-index: 20;
  width: 240px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  // arrow pointing at the "..." button
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 10px;
    width: 12px;
    height: 12px;
    background: #fff;
    transform: rotate(45deg);
    box-shadow: -2px -2px 3px rgba(0, 0, 0, 0.06);
  }
}

.card-menu__item {
  gap: 12px;
  padding: 14px 20px;
  border: 0;
  background: none;
  color: var(--pm-primary);
  font-size: 1rem;

  & + & {
    border-top: 1px solid var(--pm-divider);
  }

  // the list can't clip with overflow: hidden (it would cut the arrow),
  // so the hover background follows the corners here
  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
  }

  &:hover,
  &:focus-visible {
    background: var(--pm-bg);
  }
}
</style>
