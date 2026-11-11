<script setup lang="ts" generic="T extends string">
// Custom listbox: the design styles the open options, which a native <select> cannot do.
// Keyboard: Enter/Space/ArrowDown open, arrows move, Enter selects, Escape closes.
const { options, label } = defineProps<{
  options: { value: T, label: string }[]
  label: string
}>()
const selected = defineModel<T>({ required: true })

const open = ref(false)
const activeIndex = ref(0)
const root = useTemplateRef('root')
const listId = useId()

const selectedLabel = computed(() => options.find(option => option.value === selected.value)?.label)

onClickOutside(root, () => close())

function toggle() {
  if (open.value) return close()
  activeIndex.value = Math.max(0, options.findIndex(option => option.value === selected.value))
  open.value = true
}

function close() {
  open.value = false
}

function choose(value: T) {
  selected.value = value
  close()
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      toggle()
    }
    return
  }
  const actions: Record<string, () => void> = {
    'ArrowDown': () => (activeIndex.value = (activeIndex.value + 1) % options.length),
    'ArrowUp': () => (activeIndex.value = (activeIndex.value - 1 + options.length) % options.length),
    'Home': () => (activeIndex.value = 0),
    'End': () => (activeIndex.value = options.length - 1),
    'Enter': () => choose(options[activeIndex.value]!.value),
    ' ': () => choose(options[activeIndex.value]!.value),
    'Escape': close,
    'Tab': close,
  }
  const action = actions[event.key]
  if (!action) return
  if (event.key !== 'Tab') event.preventDefault()
  action()
}
</script>

<template>
  <div
    ref="root"
    class="base-select position-relative"
    :class="{ 'base-select--open': open }"
  >
    <button
      type="button"
      class="base-select__trigger bg-white d-flex align-items-center justify-content-between w-100 text-start"
      role="combobox"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open ? `${listId}-${activeIndex}` : undefined"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span>{{ selectedLabel }}</span>
      <Icon
        :name="open ? 'ph:caret-up-light' : 'ph:caret-down-light'"
        size="20"
      />
    </button>
    <ul
      v-show="open"
      :id="listId"
      class="base-select__options position-absolute top-100 start-0 end-0 list-unstyled m-0 p-0 bg-white overflow-hidden"
      role="listbox"
      :aria-label="label"
    >
      <li
        v-for="(option, index) in options"
        :id="`${listId}-${index}`"
        :key="option.value"
        role="option"
        class="base-select__option"
        :class="{ 'base-select__option--active': index === activeIndex }"
        :aria-selected="option.value === selected"
        @click="choose(option.value)"
        @mouseenter="activeIndex = index"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.base-select {
  width: 296px;
}

.base-select__trigger {
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--pm-gray);
  border-radius: 4px;
  color: var(--pm-dark);

  &:focus-visible {
    outline: 2px solid var(--pm-primary);
    outline-offset: 1px;
  }
}

.base-select--open .base-select__trigger {
  border-color: var(--pm-primary);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.base-select__options {
  z-index: 10;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
}

.base-select__option {
  padding: 16px;
  cursor: pointer;
  color: var(--pm-dark);

  & + & {
    border-top: 1px solid var(--pm-divider);
  }
}

.base-select__option--active {
  background: var(--pm-bg);
}

@media (max-width: 575.98px) {
  .base-select {
    width: 100%;
  }
}
</style>
