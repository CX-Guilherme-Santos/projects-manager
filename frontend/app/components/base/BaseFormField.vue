<script setup lang="ts">
const { label, required = false, error } = defineProps<{
  label: string
  required?: boolean
  error?: string
}>()

const id = useId()
const errorId = `${id}-error`
</script>

<template>
  <div
    class="form-field"
    :class="{ 'form-field--invalid': !!error }"
  >
    <label
      :for="id"
      class="form-field__label d-flex align-items-baseline mb-1"
    >
      {{ label }}
      <small v-if="required">(Obrigatório)</small>
    </label>
    <slot
      :id="id"
      :invalid="!!error"
      :describedby="error ? errorId : undefined"
    />
    <p
      v-if="error"
      :id="errorId"
      class="form-field__error mt-1 mb-0"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.form-field__label {
  gap: 10px;
  color: var(--pm-primary);
  font-size: 1.125rem;

  small {
    color: var(--pm-gray);
    font-size: 0.875rem;
  }
}

.form-field--invalid .form-field__label,
.form-field--invalid .form-field__label small {
  color: var(--pm-danger);
}

.form-field__error {
  color: var(--pm-danger);
  font-size: 0.875rem;
}
</style>
