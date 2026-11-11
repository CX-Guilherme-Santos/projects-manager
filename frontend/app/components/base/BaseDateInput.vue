<script setup lang="ts">
// Native date input (dd/mm/aaaa in pt-BR browsers, mobile pickers for free)
// with the design's calendar icon in place of the browser's own indicator.
defineOptions({ inheritAttrs: false })
const { icon, invalid = false } = defineProps<{ icon: string, invalid?: boolean }>()
const value = defineModel<string>()

const input = useTemplateRef('input')

function openPicker() {
  input.value?.focus()
  input.value?.showPicker?.()
}
</script>

<template>
  <div
    class="date-input"
    :class="{ 'date-input--invalid': invalid, 'date-input--empty': !value }"
  >
    <input
      ref="input"
      v-model="value"
      v-bind="$attrs"
      type="date"
      class="form-control"
      :class="{ 'is-invalid': invalid }"
    >
    <button
      type="button"
      class="date-input__icon"
      tabindex="-1"
      aria-hidden="true"
      @click="openPicker"
    >
      <Icon
        :name="icon"
        size="26"
      />
    </button>
  </div>
</template>

<style scoped lang="scss">
.date-input {
  position: relative;

  .form-control {
    padding-right: 48px;

    &::-webkit-calendar-picker-indicator {
      display: none;
    }
  }
}

.date-input--empty .form-control:not(:focus) {
  // the design shows an empty field, not the browser's "dd/mm/aaaa" mask
  color: transparent;
}

.date-input__icon {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  padding: 0;
  border: 0;
  background: none;
  color: var(--pm-gray);
  transform: translateY(-50%);
}

.date-input--invalid .date-input__icon {
  color: var(--pm-danger);
}
</style>
