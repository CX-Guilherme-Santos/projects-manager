<script setup lang="ts">
// Dialog with backdrop, Escape to close, focus kept inside and returned on close
const { open } = defineProps<{ open: boolean, labelledby: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = useTemplateRef('dialog')
const bodyLocked = useScrollLock(import.meta.client ? document.body : null)
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

watch(() => open, async (isOpen) => {
  bodyLocked.value = isOpen
  if (isOpen) {
    previouslyFocused = document.activeElement as HTMLElement | null
    await nextTick()
    dialog.value?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }
  else {
    previouslyFocused?.focus()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  bodyLocked.value = false
})

function trapFocus(event: KeyboardEvent) {
  const focusables = [...(dialog.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
  if (!focusables.length) return
  const first = focusables[0]!
  const last = focusables.at(-1)!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="base-modal">
      <div
        v-if="open"
        class="base-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        @click.self="emit('close')"
        @keydown.esc="emit('close')"
        @keydown.tab="trapFocus"
      >
        <div
          ref="dialog"
          class="base-modal__dialog position-relative bg-white"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="labelledby"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.base-modal {
  z-index: 1050;
  padding: 16px;
  background: rgba(33, 31, 43, 0.85);
  backdrop-filter: blur(4px);
}

.base-modal__dialog {
  width: min(582px, 100%);
  padding: 32px;
  border-radius: 4px;
  box-shadow: var(--pm-shadow);
}

.base-modal-enter-active,
.base-modal-leave-active {
  transition: opacity 0.15s ease;
}

.base-modal-enter-from,
.base-modal-leave-to {
  opacity: 0;
}
</style>
