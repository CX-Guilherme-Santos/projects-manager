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
      class="form-field__label"
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
      class="form-field__error"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.form-field__label {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
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
  margin: 4px 0 0;
  color: var(--pm-danger);
  font-size: 0.875rem;
}
</style>
